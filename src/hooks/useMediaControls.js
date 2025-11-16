import { useContext, useEffect } from 'react';
import { DashboardStateContext } from '../Utils/DashboardStateProvider';
import { getSocket } from '../Utils/socket';
import webrtcManager from '../Utils/webrtc';

export const useMediaControls = () => {
  const {
    localStream,
    isMicActive,
    setMicActive,
    isCameraActive,
    setCameraActive,
    isScreenShareActive,
    setScreenShareActive,
    roomId,
    userId
  } = useContext(DashboardStateContext);

  // Toggle Microphone
  useEffect(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(track => {
          track.enabled = isMicActive;
        });
        console.log(`🎤 Microphone ${isMicActive ? 'enabled' : 'muted'}`);
        
        // Broadcast mic state to other participants
        if (roomId && userId) {
          const socket = getSocket();
          socket.emit('toggle-mic', { roomId, userId, micOn: isMicActive });
        }
      } else {
        console.warn('⚠️ No audio tracks found in local stream');
      }
    } else {
      console.warn('⚠️ No local stream available for microphone control');
    }
  }, [isMicActive, localStream, roomId, userId]);

  // Toggle Camera
  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = isCameraActive;
        });
        console.log(`📹 Camera ${isCameraActive ? 'enabled' : 'disabled'}`);
        
        // Broadcast camera state to other participants
        if (roomId && userId) {
          const socket = getSocket();
          socket.emit('toggle-camera', { roomId, userId, cameraOn: isCameraActive });
        }
      } else {
        console.warn('⚠️ No video tracks found in local stream');
      }
    } else {
      console.warn('⚠️ No local stream available for camera control');
    }
  }, [isCameraActive, localStream, roomId, userId]);

  // Handle Screen Share with WebRTC integration
  useEffect(() => {
    const handleScreenShare = async () => {
      if (isScreenShareActive) {
        try {
          console.log('🖥️ Starting screen share via WebRTC...');
          await webrtcManager.startScreenShare();
          console.log('✅ Screen share started successfully via WebRTC');
        } catch (error) {
          console.error('❌ Screen share error:', error);
          setScreenShareActive(false);

          if (error.name === 'NotAllowedError') {
            console.log('Screen sharing permission denied');
          } else if (error.name === 'NotSupportedError') {
            console.log('Screen sharing not supported in this browser');
          } else {
            console.log('Failed to start screen sharing:', error.message);
          }
        }
      } else {
        // Stop screen share
        webrtcManager.stopScreenShare();
        console.log('🖥️ Screen share stopped');
      }
    };

    // Set up callback for when screen share ends via browser UI
    webrtcManager.onScreenShareEnd(() => {
      setScreenShareActive(false);
    });

    if (isScreenShareActive !== undefined && roomId) {
      handleScreenShare();
    }
  }, [isScreenShareActive, roomId, setScreenShareActive]);

  return {
    toggleMic: () => setMicActive(!isMicActive),
    toggleCamera: () => setCameraActive(!isCameraActive),
    toggleScreenShare: () => setScreenShareActive(!isScreenShareActive)
  };
};
