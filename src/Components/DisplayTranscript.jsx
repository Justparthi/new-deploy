import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

// Firebase Configuration
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

const TranscriptViewer = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [groupedTranscripts, setGroupedTranscripts] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const q = query(
        collection(db, 'transcripts'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transcriptData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transcriptData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });
      
      setTranscripts(transcriptData);
      groupTranscripts(transcriptData);
      
      console.log(`✅ Loaded ${transcriptData.length} transcripts`);
    } catch (err) {
      console.error('❌ Error fetching transcripts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupTranscripts = (data) => {
    const grouped = {};
    
    data.forEach(transcript => {
      const sessionKey = `${transcript.roomId}-${transcript.sessionDate || 'Unknown'}`;
      
      if (!grouped[sessionKey]) {
        grouped[sessionKey] = {
          sessionId: sessionKey,
          roomId: transcript.roomId,
          sessionDate: transcript.sessionDate || 'Unknown Date',
          sessionTime: transcript.sessionTime || 'Unknown Time',
          transcripts: [],
          participants: new Set()
        };
      }
      
      grouped[sessionKey].transcripts.push(transcript);
      grouped[sessionKey].participants.add(transcript.speaker);
    });
    
    Object.values(grouped).forEach(session => {
      session.participants = Array.from(session.participants);
      session.transcripts.sort((a, b) => a.timestamp - b.timestamp);
    });
    
    setGroupedTranscripts(grouped);
  };

  const filteredSessions = Object.values(groupedTranscripts).filter(session => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      session.roomId?.toLowerCase().includes(searchLower) ||
      session.sessionDate?.toLowerCase().includes(searchLower) ||
      session.participants.some(p => p.toLowerCase().includes(searchLower)) ||
      session.transcripts.some(t => t.text?.toLowerCase().includes(searchLower))
    );
  });

  const downloadSession = (session) => {
    const text = [
      `Meeting Transcript`,
      `Room ID: ${session.roomId}`,
      `Date: ${session.sessionDate}`,
      `Time: ${session.sessionTime}`,
      `Participants: ${session.participants.join(', ')}`,
      `Total Messages: ${session.transcripts.length}`,
      '═'.repeat(60),
      '',
      ...session.transcripts.map(t => {
        const time = t.timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        return `[${time}] ${t.speaker}: ${t.text}`;
      })
    ].join('\n');
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${session.roomId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: '500' }}>Loading transcripts...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '28rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <svg style={{ width: '24px', height: '24px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 style={{ color: '#fca5a5', fontWeight: '600', fontSize: '1.125rem', margin: 0 }}>Error Loading Transcripts</h3>
          </div>
          <p style={{ color: '#fecaca', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={fetchTranscripts}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#b91c1c'}
            onMouseOut={(e) => e.target.style.background = '#dc2626'}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Detail View
  if (view === 'detail' && selectedSession) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        overflow: 'auto'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Back Button */}
          <button
            onClick={() => {
              setView('list');
              setSelectedSession(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#93c5fd',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              marginBottom: '1.5rem',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#60a5fa';
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#93c5fd';
              e.currentTarget.style.background = 'none';
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sessions
          </button>
          
          {/* Session Header */}
          <div style={{
            background: 'rgba(40, 40, 40, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', margin: '0 0 0.5rem 0' }}>Session Details</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#9ca3af', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {selectedSession.sessionDate}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedSession.sessionTime}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => downloadSession(selectedSession)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
                  color: 'white',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  transition: 'all 0.25s',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(59, 130, 246, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Room ID</div>
                <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '0.9375rem', fontWeight: '500' }}>{selectedSession.roomId}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Messages</div>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>{selectedSession.transcripts.length}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Participants</div>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>{selectedSession.participants.length}</div>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Participants</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedSession.participants.map((participant, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.375rem 0.875rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Transcript Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedSession.transcripts.map((transcript) => (
              <div
                key={transcript.id}
                style={{
                  background: 'rgba(40, 40, 40, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(50, 50, 50, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(40, 40, 40, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {transcript.speaker.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: '#93c5fd', fontWeight: '500', fontSize: '0.9375rem' }}>{transcript.speaker}</span>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    {transcript.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                <p style={{ color: '#d1d5db', lineHeight: '1.6', margin: 0, paddingLeft: '2.5rem', fontSize: '0.9375rem' }}>{transcript.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      overflow: 'auto'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white', margin: '0 0 0.5rem 0' }}>Transcript Dashboard</h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem' }}>View and manage all your meeting transcripts</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: 'Total Sessions', value: Object.keys(groupedTranscripts).length, color: '#3b82f6' },
            { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Total Messages', value: transcripts.length, color: '#06b6d4' },
            { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Participants', value: new Set(transcripts.map(t => t.speaker)).size, color: '#10b981' },
            { icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', label: 'Rooms', value: new Set(transcripts.map(t => t.roomId)).size, color: '#8b5cf6' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'rgba(40, 40, 40, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${stat.color}20`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '24px', height: '24px', color: stat.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div style={{
          background: 'rgba(40, 40, 40, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
              <svg style={{
                width: '20px',
                height: '20px',
                color: '#9ca3af',
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by room, date, participant, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem 0.625rem 2.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
            <button
              onClick={fetchTranscripts}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
                color: 'white',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                fontSize: '0.9375rem',
                transition: 'all 0.25s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div style={{
            background: 'rgba(40, 40, 40, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <svg style={{ width: '40px', height: '40px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>No Transcripts Found</h3>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Start a meeting to create transcripts'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                onClick={() => {
                  setSelectedSession(session);
                  setView('detail');
                }}
                style={{
                  background: 'rgba(40, 40, 40, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(50, 50, 50, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.boxShadow = '0 10px 32px rgba(0, 0, 0, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(40, 40, 40, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }}>
                    {session.transcripts.length}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSession(session);
                    }}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                      e.currentTarget.style.color = '#60a5fa';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
                
                <h3 style={{
                  color: 'white',
                  fontWeight: '600',
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.0625rem',
                  transition: 'color 0.2s'
                }}>
                  Room: {session.roomId}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
                    <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {session.sessionDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
                    <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {session.sessionTime}
                  </div>
                </div>
                
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>Participants</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {session.participants.slice(0, 3).map((participant, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.25rem 0.625rem',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#93c5fd',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: '1px solid rgba(59, 130, 246, 0.25)'
                        }}
                      >
                        {participant}
                      </span>
                    ))}
                    {session.participants.length > 3 && (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#9ca3af',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        +{session.participants.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ color: '#9ca3af' }}>{session.transcripts.length} messages</span>
                  <span style={{
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: '500'
                  }}>
                    View Details
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptViewer;