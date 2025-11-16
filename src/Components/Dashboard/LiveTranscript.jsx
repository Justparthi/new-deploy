import { useState, useRef, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase Configuration
// Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDf0VwgNiyg-NrUQeGX_SgQTgBMV0wu5a4",
  authDomain: "meet-187aa.firebaseapp.com",
  projectId: "meet-187aa",
  storageBucket: "meet-187aa.firebasestorage.app",
  messagingSenderId: "798601413023",
  appId: "1:798601413023:web:aeaf31e5ff0353c5e1bdaa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * LiveTranscript Component - Firebase integrated transcript storage
 * 
 * Features:
 * - Real-time speech recognition
 * - Firebase Firestore storage (separate document per transcript)
 * - Download transcripts
 * - Auto-save every 30 seconds
 */
const LiveTranscript = ({ 
  localStream, 
  remoteStreams, 
  userName,
  roomId,
  isVisible = true,
  onClose 
}) => {
  // Refs
  const recognitionRef = useRef(null);
  const transcriptScrollRef = useRef(null);
  const isManualStopRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const unsavedTranscriptsRef = useRef([]); // Buffer for unsaved transcripts

  // State
  const [transcripts, setTranscripts] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check microphone permission
  useEffect(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        setHasAudioPermission(true);
        console.log('✅ Microphone permission granted');
      } else {
        setHasAudioPermission(false);
        console.warn('⚠️ Microphone not available or disabled');
      }
    }
  }, [localStream]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Speech recognition not supported');
      setRecognitionSupported(false);
      addSystemMessage('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      reconnectAttemptsRef.current = 0;
    };

    recognition.onresult = (event) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          console.log('📝 Final transcript:', transcript);
          
          const transcriptEntry = {
            speaker: userName || 'You',
            text: transcript.trim(),
            timestamp: new Date().toISOString()
          };
          
          addTranscript(transcriptEntry);
          // Add to unsaved buffer
          unsavedTranscriptsRef.current.push(transcriptEntry);
          
          setInterimTranscript('');
        } else {
          interim += transcript;
        }
      }
      
      if (interim) {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('🔴 Speech recognition error:', event.error);
      
      const errorMessages = {
        'network': 'Network error: Please check your internet connection.',
        'audio-capture': 'Microphone error: Please check your microphone permissions.',
        'not-allowed': 'Permission denied: Please allow microphone access.',
        'service-not-allowed': 'Speech recognition service is not available.',
        'no-speech': 'No speech detected. Listening will continue automatically.'
      };

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
        const message = errorMessages[event.error] || `Recognition error: ${event.error}`;
        addSystemMessage(message, 'error');
        setIsListening(false);
        isManualStopRef.current = true;
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      
      if (!isManualStopRef.current) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(500 * reconnectAttemptsRef.current, 3000);
        
        console.log(`🔄 Auto-restarting recognition in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (!isManualStopRef.current) {
              console.log('▶️ Restarting speech recognition...');
              recognition.start();
            }
          } catch (error) {
            console.error('❌ Failed to restart recognition:', error);
            if (reconnectAttemptsRef.current < 5) {
              setTimeout(() => recognition.onend(), 1000);
            } else {
              setIsListening(false);
              addSystemMessage('Failed to maintain speech recognition. Please restart manually.', 'error');
            }
          }
        }, delay);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    console.log('✅ Speech recognition initialized');

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition cleanup:', e);
        }
      }
    };
  }, [userName]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts, interimTranscript]);

  // Auto-save transcripts periodically (every 30 seconds while listening)
  useEffect(() => {
    let saveInterval;
    
    if (isListening && unsavedTranscriptsRef.current.length > 0) {
      saveInterval = setInterval(() => {
        if (unsavedTranscriptsRef.current.length > 0) {
          console.log('⏰ Auto-saving transcripts...');
          saveTranscriptsToFirebase();
        }
      }, 30000); // Save every 30 seconds
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isListening]);

  // Helper functions
  const addTranscript = (transcript) => {
    setTranscripts(prev => [...prev, {
      id: Date.now() + Math.random(),
      speaker: transcript.speaker,
      text: transcript.text,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      isFinal: true
    }]);
  };

  const addSystemMessage = (text, type = 'info') => {
    setTranscripts(prev => [...prev, {
      id: Date.now() + Math.random(),
      speaker: 'System',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFinal: true,
      isError: type === 'error',
      isInfo: type === 'info'
    }]);
  };

  // Save transcripts to Firebase Firestore
  const saveTranscriptsToFirebase = async () => {
    if (unsavedTranscriptsRef.current.length === 0) {
      console.log('📝 No new transcripts to save');
      return { success: true, message: 'No transcripts to save' };
    }

    try {
      console.log(`💾 Saving ${unsavedTranscriptsRef.current.length} transcripts to Firebase...`);
      setIsSaving(true);
      
      const transcriptsToSave = [...unsavedTranscriptsRef.current];
      const savedCount = [];

      // Save each transcript as a separate document in the 'transcripts' collection
      for (const transcript of transcriptsToSave) {
        const docRef = await addDoc(collection(db, 'transcripts'), {
          roomId: roomId,
          userName: userName || 'Anonymous',
          speaker: transcript.speaker,
          text: transcript.text,
          timestamp: new Date(transcript.timestamp),
          createdAt: serverTimestamp(),
          sessionDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          sessionTime: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })
        });
        
        savedCount.push(docRef.id);
        console.log(`✅ Transcript saved with ID: ${docRef.id}`);
      }

      console.log(`✅ All ${savedCount.length} transcripts saved successfully to Firebase`);
      
      // Clear the unsaved buffer after successful save
      unsavedTranscriptsRef.current = [];
      
      return { 
        success: true, 
        message: `${savedCount.length} transcripts saved`,
        documentIds: savedCount 
      };
    } catch (error) {
      console.error('❌ Error saving transcripts to Firebase:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        roomId,
        transcriptCount: unsavedTranscriptsRef.current.length
      });
      addSystemMessage(`Failed to save: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle transcription
  const toggleTranscription = async () => {
    if (!recognitionRef.current) {
      addSystemMessage('Speech recognition not available', 'error');
      return;
    }

    if (!hasAudioPermission) {
      addSystemMessage('Microphone permission required. Please enable your microphone.', 'error');
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping transcription...');
      isManualStopRef.current = true;
      
      try {
        recognitionRef.current.stop();
        
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        setIsListening(false);
        setInterimTranscript('');
        
        // Save any remaining transcripts to Firebase
        if (unsavedTranscriptsRef.current.length > 0) {
          addSystemMessage('⏹️ Transcription stopped. Saving to Firebase...', 'info');
          
          try {
            await saveTranscriptsToFirebase();
            addSystemMessage('✅ Transcripts saved successfully to Firebase', 'info');
          } catch (error) {
            console.error('Error saving transcripts:', error);
            addSystemMessage(`❌ Error saving transcripts: ${error.message}`, 'error');
          }
        } else {
          addSystemMessage('⏹️ Transcription stopped (no content to save)', 'info');
        }
      } catch (error) {
        console.error('❌ Error stopping:', error);
        setIsListening(false);
      }
    } else {
      console.log('▶️ Starting transcription...');
      isManualStopRef.current = false;
      reconnectAttemptsRef.current = 0;
      unsavedTranscriptsRef.current = []; // Reset buffer
      
      try {
        await recognitionRef.current.start();
        
        addSystemMessage('🎙️ Recording started - Speech will be saved to Firebase every 30 seconds', 'info');
        
        if (remoteStreams?.size > 0) {
          addSystemMessage('⚠️ Note: Only your voice will be transcribed.', 'info');
        }
      } catch (error) {
        console.error('❌ Error starting:', error);
        
        if (error.name === 'NotAllowedError') {
          addSystemMessage('Microphone permission denied. Please allow microphone access in your browser settings.', 'error');
        } else if (error.name === 'NotFoundError') {
          addSystemMessage('No microphone found. Please connect a microphone and try again.', 'error');
        } else {
          addSystemMessage('Failed to start transcription. Please refresh the page and try again.', 'error');
        }
        
        setIsListening(false);
        isManualStopRef.current = true;
      }
    }
  };

  // Clear transcripts
  const clearTranscripts = () => {
    setTranscripts([]);
    setInterimTranscript('');
    unsavedTranscriptsRef.current = [];
    addSystemMessage('🗑️ Transcripts cleared', 'info');
  };

  // Download transcripts
  const downloadTranscripts = () => {
    if (transcripts.length === 0) return;

    const text = [
      `Meeting Transcript - ${roomId}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Total Messages: ${transcripts.filter(t => !t.isInfo && !t.isError).length}`,
      '─'.repeat(50),
      '',
      ...transcripts.map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
    ].join('\n');
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${roomId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addSystemMessage('💾 Transcript downloaded', 'info');
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        .transcript-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .transcript-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }
        .transcript-scroll::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        .transcript-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
      
      <div className="w-96 bg-white/5 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Live Transcript
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status Info */}
          <div className="mb-3 p-3 bg-white/5 rounded-lg text-xs text-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : hasAudioPermission ? 'bg-gray-500' : 'bg-red-500'}`}></span>
              <span className="font-medium">
                {isListening ? 'Recording' : hasAudioPermission ? 'Ready' : 'Unavailable'}
              </span>
            </div>
            
            <div className="space-y-1 pl-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Speaker:</span>
                <span className="font-medium">{userName || 'You'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Messages:</span>
                <span className="font-medium">{transcripts.filter(t => !t.isInfo && !t.isError).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Unsaved:</span>
                <span className={`font-medium ${unsavedTranscriptsRef.current.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {unsavedTranscriptsRef.current.length}
                </span>
              </div>
              {isSaving && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-medium text-blue-400">Saving to Firebase...</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={toggleTranscription}
              disabled={!recognitionSupported || !hasAudioPermission || isSaving}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Stop
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start
                </>
              )}
            </button>
            
            <button
              onClick={clearTranscripts}
              disabled={isSaving}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
              title="Clear transcripts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            <button
              onClick={downloadTranscripts}
              disabled={transcripts.length === 0 || isSaving}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download transcript"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Transcript Messages */}
        <div 
          ref={transcriptScrollRef} 
          className="transcript-scroll flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
          }}
        >
          {transcripts.length === 0 && !interimTranscript ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm px-4 mb-2">
                {isListening ? 'Listening... Start speaking' : hasAudioPermission ? 'Click "Start" to begin' : 'Enable microphone'}
              </p>
              <p className="text-gray-500 text-xs px-4">
                Auto-saves to Firebase every 30 seconds
              </p>
            </div>
          ) : (
            <>
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className={`backdrop-blur-sm rounded-lg p-3 border transition-all ${
                    transcript.isError
                      ? 'bg-red-500/10 border-red-500/30'
                      : transcript.isInfo
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      transcript.isError ? 'text-red-400' :
                      transcript.isInfo ? 'text-blue-400' :
                      transcript.speaker === userName ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {transcript.speaker}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {transcript.timestamp}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    transcript.isError ? 'text-red-300' :
                    transcript.isInfo ? 'text-blue-300' :
                    'text-gray-200'
                  }`}>
                    {transcript.text}
                  </p>
                </div>
              ))}
              
              {/* Interim transcript */}
              {interimTranscript && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm rounded-lg p-3 animate-pulse">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-400">
                      {userName || 'You'} (speaking...)
                    </span>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  </div>
                  <p className="text-sm leading-relaxed text-yellow-300 italic">
                    {interimTranscript}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Bar */}
        {(isListening || isSaving) && (
          <div className="flex-shrink-0 p-3 bg-black/30 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isSaving ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                <span>{isSaving ? 'Saving to Firebase...' : `Recording (${unsavedTranscriptsRef.current.length} unsaved)`}</span>
              </div>
              <div className="text-gray-500">
                Auto-save: 30s
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LiveTranscript;