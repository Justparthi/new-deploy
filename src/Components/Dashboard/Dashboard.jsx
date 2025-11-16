// Complete updated Dashboard.jsx with authenticated user display

import Controls from "./controls/Controls";
import { useState, useRef, useContext, useEffect } from "react";
import Webcam from "react-webcam";
import { DashboardStateContext } from "../../Utils/DashboardStateProvider";
import { useAuth } from "../../Utils/AuthContext"; // ADD THIS IMPORT
import Chat from './Chat/Chat';
import DualChat from './Chat/DualChat';
import Participants from "./Participants/Participants";
import InviteParticipant from "./Settings/InviteParticipant";
import { useMeetingRoom } from "../../hooks/useMeetingRoom";
import { useMediaControls } from "../../hooks/useMediaControls";
import MeetingLinkBanner from "./MeetingLinkBanner";
import ErrorModal from "../ErrorModal/ErrorModal";
import NamePromptModal from "../NamePromptModal/NamePromptModal";
import LiveTranscript from "./LiveTranscript";
import { API_ENDPOINTS } from "../../Utils/apiConfig";
import "./Dashboard.css";

const Dashboard = () => {
  console.log('🎬 Dashboard component rendering...');

  // ADD: Get authenticated user
  const { currentUser } = useAuth();

  // Helper function to determine grid layout class
  const getGridClass = (totalParticipants) => {
    if (totalParticipants <= 1) return 'single-participant';
    if (totalParticipants === 2) return 'two-participants';
    if (totalParticipants === 3) return 'three-participants';
    if (totalParticipants === 4) return 'four-participants';
    return 'many-participants';
  };

  // Context values
  const { 
    isCameraActive, 
    setCameraActive,
    isChatBoxActive, 
    setChatBoxActive,
    isParticipantsActive, 
    setParticipantsActive,
    isInviteParticipant, 
    setInviteParticipant,
    addParticipant, 
    localStream, 
    remoteStreams, 
    participantMediaStates, 
    connectionStatuses, 
    roomId, 
    userName, 
    participantsList, 
    setUserName 
  } = useContext(DashboardStateContext);
  
  const { initializeMeeting, getMeetingLink, copyMeetingLink } = useMeetingRoom();
  
  // Initialize media controls
  useMediaControls();
  
  // Refs
  const webcamRef = useRef(null);
  const localVideoRef = useRef(null);

  // State
  const [isOpen, setIsOpen] = useState(true);
  const [meetingInitialized, setMeetingInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isJoiningViaLink, setIsJoiningViaLink] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [browserError, setBrowserError] = useState('');
  const [showTranscript, setShowTranscript] = useState(true);

  // Detect mobile devices and check browser support
  useEffect(() => {
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    const hasWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
    const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    
    const isLocalNetworkIP = () => {
      const hostname = window.location.hostname;
      const localIPRegex = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
      return localIPRegex.test(hostname);
    };
    
    const isSecure = window.location.protocol === 'https:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('ngrok') ||
                    isLocalNetworkIP();

    if (!hasWebRTC) {
      setBrowserSupported(false);
      setBrowserError('WebRTC is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
    } else if (!hasGetUserMedia) {
      setBrowserSupported(false);
      setBrowserError('Camera and microphone access is not available in this browser.');
    } else if (!isSecure) {
      setBrowserSupported(false);
      setBrowserError('HTTPS is required for camera/microphone access. Please use HTTPS or localhost.');
    } else {
      setBrowserSupported(true);
      console.log('✅ Browser compatibility check passed');
    }
  }, []);

  const webcamStyle = {
    width: '100%',
    height: '100%',
  };

  // UPDATED: Use authenticated user's name
  useEffect(() => {
    if (!userName && !showNamePrompt) {
      if (currentUser) {
        // Use authenticated user's display name or email
        const authenticatedName = currentUser.displayName || 
                                 currentUser.email?.split('@')[0] || 
                                 `User-${Math.random().toString(36).substr(2, 6)}`;
        setUserName(authenticatedName);
        console.log(`👤 Using authenticated username: ${authenticatedName}`);
      } else {
        // Fallback for non-authenticated users
        const generatedName = `Guest-${Math.random().toString(36).substr(2, 6)}`;
        setUserName(generatedName);
        console.log(`👤 Using guest username: ${generatedName}`);
      }
    }
  }, [userName, showNamePrompt, setUserName, currentUser]);

  // Check if joining via link
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/room\/([^\/]+)/);
    const urlRoomId = match ? match[1] : null;
    
    if (urlRoomId && !userName && !isJoiningViaLink) {
      console.log('🚪 Showing name prompt for better UX');
      setIsJoiningViaLink(true);
      setShowNamePrompt(true);
    } else if (!meetingInitialized && userName) {
      console.log('🚀 Initializing meeting with name:', userName);
      initializeMeeting().catch(error => {
        console.error('Failed to initialize meeting:', error);
        setError(error);
        setShowErrorModal(true);
      });
      setMeetingInitialized(true);
    }
  }, [meetingInitialized, initializeMeeting, userName, isJoiningViaLink]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('🚪 Dashboard unmounting, cleaning up...');
      const locationState = window.history.state?.usr;
      const currentRoomId = roomId || locationState?.roomId;
      const currentUserId = locationState?.userId;
      
      if (currentRoomId && currentUserId) {
        fetch(API_ENDPOINTS.ROOM_LEAVE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: currentRoomId, userId: currentUserId }),
          keepalive: true
        }).catch(error => console.error('Failed to notify server:', error));
      }
    };
  }, [roomId]);

  const handleNameSubmit = (name) => {
    setUserName(name);
    setShowNamePrompt(false);
    initializeMeeting(name).catch(error => {
      console.error('Failed to initialize meeting:', error);
      setError(error);
      setShowErrorModal(true);
    });
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleToggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  // Get display name (prioritize authenticated user)
  const displayName = currentUser?.displayName || userName || 'User';

  return (
    <>
      <NamePromptModal 
        isOpen={showNamePrompt} 
        onSubmit={handleNameSubmit}
        roomId={roomId}
      />
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        error={error} 
      />

      {!browserSupported && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full text-center border border-gray-800">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Browser Not Supported</h2>
            <p className="text-gray-300 mb-4">{browserError}</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: 'transparent'
        }}></div>
        
        <MeetingLinkBanner 
          roomCode={roomId}
          meetingId={window.history.state?.usr?.meetingId}
          roomName={window.history.state?.usr?.roomName || `${displayName}'s Meeting`}
          hostName={window.history.state?.usr?.hostName || displayName}
          meetingLink={roomId ? `${window.location.origin}/room/${roomId}` : `${window.location.origin}/room/default`}
        />
        
        <div className="relative z-10 flex h-screen text-gray-200">
          {(isChatBoxActive || isParticipantsActive) && (
            <aside className="w-80 bg-gray-800/60 backdrop-blur-md border-r border-gray-800 shadow-lg">
              <div className="h-full flex flex-col">
                {isChatBoxActive && <DualChat />}
                {isParticipantsActive && <Participants />}
              </div>
            </aside>
          )}
          
          <main className={`flex-1 flex flex-col`}>
            <section className="flex-1 overflow-hidden">
              <div className={`video-grid ${getGridClass(participantsList.length + 1)} h-full`}>
                {/* Local Video - UPDATED display name */}
                <div className="video-container bg-gray-800/30 border border-gray-800 rounded-md overflow-hidden relative">
                  <div className="h-full w-full">
                    {localStream && isCameraActive ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={webcamStyle}
                        className="w-full h-full object-cover mirror-video"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className='text-white text-lg font-medium mt-3'>Camera is off</h3>
                      </div>
                    )}
                  </div>
                  
                  {/* UPDATED User Info Overlay */}
                  <div className="participant-label absolute left-3 bottom-3 flex items-center gap-2 bg-gray-900/60 px-3 py-1 rounded-md border border-gray-800">
                    <span className="status-indicator inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-sm text-white">{displayName}</span>
                    <span className="text-gray-400 text-xs ml-1">(You)</span>
                  </div>
                </div>

                {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                  <RemoteVideo
                    key={userId}
                    userId={userId}
                    stream={stream}
                    participantsList={participantsList}
                    mediaState={participantMediaStates.get(userId)}
                    connectionStatus={connectionStatuses.get(userId)}
                  />
                ))}
                
                {remoteStreams.size === 0 && (
                  <div className="video-container bg-gray-800/20 border border-dashed border-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                    <div className="h-full w-full flex flex-col items-center justify-center p-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center mb-5">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className='text-white text-lg font-semibold mb-1'>Waiting for participants</h3>
                    </div>
                  </div>
                )}
              </div>
            </section>
            
            <div className="controls-container flex-shrink-0 p-5 border-t border-gray-800 bg-gray-900/40">
              <Controls 
                onToggleTranscript={handleToggleTranscript} 
                showTranscript={showTranscript} 
              />
            </div>
          </main>

          {showTranscript && (
            <aside className="w-96 bg-gray-800/60 backdrop-blur-md border-l border-gray-800 shadow-xl">
              <LiveTranscript 
                localStream={localStream}
                remoteStreams={remoteStreams}
                userName={displayName}
                roomId={roomId}
                isVisible={showTranscript}
                onClose={() => setShowTranscript(false)}
              />
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

// RemoteVideo Component (unchanged)
const RemoteVideo = ({ userId, stream, participantsList, mediaState, connectionStatus }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const participant = participantsList?.find(p => p.userId === userId);
  const participantName = participant?.name || `User-${userId.slice(-6)}`;
  const isCameraOn = mediaState?.cameraOn !== false;
  const isMicOn = mediaState?.micOn !== false;
  const connectionQuality = connectionStatus?.quality || 'unknown';
  const isConnected = connectionStatus?.connected || false;

  return (
    <div className="video-container bg-gray-800/20 border border-gray-800 rounded-md overflow-hidden relative">
      <div className="h-full w-full">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%' }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 bg-gradient-to-br from-gray-700 to-gray-600">
              {participantName.charAt(0).toUpperCase()}
            </div>
            <h3 className='text-white text-base font-medium mb-1'>{participantName}</h3>
          </div>
        )}
      </div>
      
      <div className="participant-label absolute left-3 bottom-3 flex items-center gap-2 bg-gray-900/60 px-2 py-1 rounded-md border border-gray-800">
        <span className={`status-indicator inline-block w-2 h-2 rounded-full ${
          isConnected 
            ? (connectionQuality === 'good' ? 'bg-green-500' : 'bg-yellow-500') 
            : 'bg-red-500'
        }`}></span>
        <span className="text-sm text-white">{participantName}</span>
        {!isMicOn && (
          <svg className="w-4 h-4 text-red-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Dashboard;