import { useEffect, useContext, useCallback } from 'react';
import { DashboardStateContext } from '../Utils/DashboardStateProvider';
import { getSocket } from '../Utils/socket';
import webrtcManager from '../Utils/webrtc';

export const useMeetingRoom = () => {
  const {
    roomId,
    setRoomId,
    userId,
    setUserId,
    userName,
    setUserName,
    localStream,
    setLocalStream,
    remoteStreams,
    setRemoteStreams,
    participantsList,
    setParticipantsList,
    participantMediaStates,
    setParticipantMediaStates,
    connectionStatuses,
    setConnectionStatuses,
    isCameraActive,
    isMicActive
  } = useContext(DashboardStateContext);

  // Get room ID from URL if available
  const getRoomIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/room\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Initialize meeting room
  const initializeMeeting = useCallback(async (participantName) => {
    // Prevent multiple initializations
    if (roomId && userId) {
      console.log('⚠️ Meeting already initialized, skipping...');
      return;
    }

    try {
      console.log('🚀 Initializing meeting room...');
      
      // Get or generate room ID - prioritize URL over context
      const urlRoomId = getRoomIdFromUrl();
      const currentRoomId = urlRoomId || `room-${Date.now()}`;
      setRoomId(currentRoomId);
      console.log(`📍 Room ID: ${currentRoomId} (from URL: ${urlRoomId ? 'yes' : 'no'})`);

      // Generate unique user ID
      const currentUserId = userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setUserId(currentUserId);
      console.log(`👤 User ID: ${currentUserId}`);

      // Set user name (prioritize passed participantName)
      const currentUserName = participantName || userName || `User-${Math.random().toString(36).substr(2, 6)}`;
      setUserName(currentUserName);
      console.log(`👤 User Name: ${currentUserName}`);

      // If joining via URL, we need to join the existing room
      if (urlRoomId && participantName) {
        console.log('🚪 Joining existing room via URL...');
        
        // For now, we'll just use the room ID directly
        // In a real implementation, you might want to verify the room exists
        // and get room details from the server
        
        console.log(`✅ Successfully joined room: ${urlRoomId}`);
      }

      // Initialize Socket.IO
      console.log('🔌 Connecting to Socket.IO server...');
      const socket = getSocket();

      // Initialize local media stream
      console.log('🎥 Requesting camera and microphone access...');
      const deviceCheck = await webrtcManager.checkDeviceAvailability();

      if (!deviceCheck.browserSupported) {
        let errorMessage = 'This browser does not support video calling. ';

        if (deviceCheck.error === 'WebRTC not supported') {
          errorMessage += 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.';
        } else if (deviceCheck.error === 'getUserMedia not supported') {
          errorMessage += 'Camera and microphone access is not available in this browser.';
        } else if (deviceCheck.error === 'HTTPS required') {
          errorMessage += 'HTTPS is required for camera/microphone access. Please use HTTPS or localhost.';
        } else {
          errorMessage += 'Please update your browser or try a different one.';
        }

        throw new Error(errorMessage);
      }

      if (!deviceCheck.hasVideo && !deviceCheck.hasAudio) {
        throw new Error('No camera or microphone found. Please check your device connections.');
      }

      const stream = await webrtcManager.initializeLocalStream(
        isCameraActive && deviceCheck.hasVideo,
        isMicActive && deviceCheck.hasAudio
      );
      setLocalStream(stream);
      console.log('✅ Media stream initialized successfully');

      // Set up WebRTC stream callbacks
      webrtcManager.setOnStreamCallback((userId, stream) => {
        console.log(`📹 Setting remote stream for ${userId}`);
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.set(userId, stream);
          return newStreams;
        });
      });

      webrtcManager.setOnConnectCallback((userId) => {
        console.log(`✅ Peer connected: ${userId}`);
        setConnectionStatuses(prev => {
          const newStatuses = new Map(prev);
          newStatuses.set(userId, { connected: true, quality: 'good' });
          return newStatuses;
        });
      });

      // Join the room with participant info
      socket.emit('join-room', currentRoomId, currentUserId, {
        name: currentUserName,
        cameraOn: isCameraActive,
        micOn: isMicActive
      });
      console.log(`🚪 Joined room: ${currentRoomId} as ${currentUserName}`);
      console.log(`🔗 Meeting link: ${window.location.origin}/room/${currentRoomId}`);

      // Add current user to participants list
      setParticipantsList([{
        userId: currentUserId,
        name: currentUserName,
        message: 'Host',
        host: true // Current user is always the host for now
      }]);

      // Handle new user connected
      socket.on('user-connected', (participantInfo) => {
        const { userId: newUserId, name, cameraOn, micOn } = participantInfo;
        console.log(`👤 User connected: ${name} (${newUserId})`);
        
        // Don't create peer connection to self
        if (newUserId === currentUserId) {
          console.log(`⚠️ Ignoring self-connection for ${newUserId}`);
          return;
        }
        
        // Create peer connection as initiator with retry logic
        const createPeerWithRetry = (userId, maxRetries = 3) => {
          let retries = 0;
          const attemptCreate = () => {
            const peer = webrtcManager.createPeer(userId, socket, currentRoomId, true);
            if (!peer && retries < maxRetries) {
              retries++;
              console.log(`🔄 Retrying peer creation for ${userId} (attempt ${retries}/${maxRetries})`);
              setTimeout(attemptCreate, 1000 * retries); // Exponential backoff
              return null;
            }
            return peer;
          };
          return attemptCreate();
        };

        const peer = createPeerWithRetry(newUserId);
        if (!peer) {
          console.error(`❌ Failed to create peer for ${newUserId} after retries`);
          return;
        }
        
        // Add to participants list
        setParticipantsList(prev => {
          if (!prev.find(p => p.userId === newUserId)) {
            return [...prev, {
              userId: newUserId,
              name: name || `User-${newUserId.slice(-6)}`,
              message: 'Connected',
              host: false
            }];
          }
          return prev;
        });

        // Track media state
        setParticipantMediaStates(prev => {
          const newStates = new Map(prev);
          newStates.set(newUserId, { cameraOn, micOn });
          return newStates;
        });
      });

      // Handle existing room users
      socket.on('room-users', (users) => {
        console.log('👥 Room users:', users);
        users.forEach(participantInfo => {
          const { userId: existingUserId, name, cameraOn, micOn } = participantInfo;
          if (existingUserId !== currentUserId) {
            // Create peer connection as non-initiator with retry logic
            const createPeerWithRetry = (userId, maxRetries = 3) => {
              let retries = 0;
              const attemptCreate = () => {
                const peer = webrtcManager.createPeer(userId, socket, currentRoomId, false);
                if (!peer && retries < maxRetries) {
                  retries++;
                  console.log(`🔄 Retrying peer creation for existing user ${userId} (attempt ${retries}/${maxRetries})`);
                  setTimeout(attemptCreate, 1000 * retries); // Exponential backoff
                  return null;
                }
                return peer;
              };
              return attemptCreate();
            };

            const peer = createPeerWithRetry(existingUserId);
            if (!peer) {
              console.error(`❌ Failed to create peer for existing user ${existingUserId} after retries`);
              return;
            }
            
            // Add to participants list
            setParticipantsList(prev => {
              if (!prev.find(p => p.userId === existingUserId)) {
                return [...prev, {
                  userId: existingUserId,
                  name: name,
                  message: 'Connected',
                  host: false
                }];
              }
              return prev;
            });

            // Track media state
            setParticipantMediaStates(prev => {
              const newStates = new Map(prev);
              newStates.set(existingUserId, { cameraOn, micOn });
              return newStates;
            });
          }
        });
      });

      // Handle signaling
      socket.on('signal', ({ userId: signalUserId, signal }) => {
        console.log(`📡 Received signal from ${signalUserId}`, signal);
        console.log(`📡 Signal type:`, signal.type);
        console.log(`📡 Signal details:`, signal);
        webrtcManager.addSignal(signalUserId, signal);
      });

      // Handle user disconnected
      socket.on('user-disconnected', (disconnectedUserId) => {
        console.log(`👋 User disconnected: ${disconnectedUserId}`);
        webrtcManager.removePeer(disconnectedUserId);
        
        setParticipantsList(prev => 
          prev.filter(p => p.userId !== disconnectedUserId)
        );
        
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(disconnectedUserId);
          return newStreams;
        });

        setParticipantMediaStates(prev => {
          const newStates = new Map(prev);
          newStates.delete(disconnectedUserId);
          return newStates;
        });
      });

      // Handle camera toggle from other participants
      socket.on('user-camera-toggle', ({ userId: toggleUserId, cameraOn }) => {
        console.log(`📹 User ${toggleUserId} camera: ${cameraOn ? 'ON' : 'OFF'}`);
        setParticipantMediaStates(prev => {
          const newStates = new Map(prev);
          const currentState = newStates.get(toggleUserId) || {};
          newStates.set(toggleUserId, { ...currentState, cameraOn });
          return newStates;
        });
      });

      // Handle mic toggle from other participants
      socket.on('user-mic-toggle', ({ userId: toggleUserId, micOn }) => {
        console.log(`🎤 User ${toggleUserId} mic: ${micOn ? 'ON' : 'OFF'}`);
        setParticipantMediaStates(prev => {
          const newStates = new Map(prev);
          const currentState = newStates.get(toggleUserId) || {};
          newStates.set(toggleUserId, { ...currentState, micOn });
          return newStates;
        });
      });

      // Handle incoming streams
      webrtcManager.onStream((userId, stream) => {
        console.log(`📹 Adding stream for ${userId}`);
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.set(userId, stream);
          return newStreams;
        });
      });

      // Handle removed streams
      webrtcManager.onStreamRemoved((userId) => {
        console.log(`🗑️ Removing stream for ${userId}`);
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(userId);
          return newStreams;
        });
      });

      // Handle connection established
      webrtcManager.onConnect((userId) => {
        console.log(`🔗 WebRTC connection established with ${userId}`);
        setConnectionStatuses(prev => {
          const newStatuses = new Map(prev);
          newStatuses.set(userId, { connected: true, quality: 'good', reconnectAttempts: 0 });
          return newStatuses;
        });
      });

    } catch (error) {
      console.error('❌ Error initializing meeting:', error);
      console.error('Error details:', error.message);
      
      // Re-throw the error to be handled by the component
      throw error;
    }
  }, [roomId, userId, isCameraActive, isMicActive]);

  // Cleanup on unmount
  useEffect(() => {
    let statusInterval;

    // Set up status monitoring if meeting is initialized
    if (roomId) {
      const updateConnectionStatuses = () => {
        const allStatuses = webrtcManager.getAllConnectionStatuses();
        setConnectionStatuses(new Map(Object.entries(allStatuses)));
      };
      statusInterval = setInterval(updateConnectionStatuses, 5000);
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
      webrtcManager.cleanup();
    };
  }, [roomId]);

  // Generate shareable meeting link
  const getMeetingLink = () => {
    if (roomId) {
      return `${window.location.origin}/room/${roomId}`;
    }
    return null;
  };

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    const link = getMeetingLink();
    if (link) {
      navigator.clipboard.writeText(link);
      return true;
    }
    return false;
  };

  return {
    initializeMeeting,
    getMeetingLink,
    copyMeetingLink,
    roomId,
    userId,
    localStream,
    remoteStreams
  };
};
