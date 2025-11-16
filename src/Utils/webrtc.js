// Import SimplePeer using wrapper to handle import issues
import SimplePeer from './simplePeerWrapper.js';

// Updated ICE Servers with reliable TURN and correct STUN URLs
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { 
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: 'YOUR_TWILIO_USERNAME', // Replace with your credentials
      credential: 'YOUR_TWILIO_CREDENTIAL'
    },
    {
      urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
      username: 'YOUR_TWILIO_USERNAME',
      credential: 'YOUR_TWILIO_CREDENTIAL'
    },
    {
      urls: 'turn:relay.metered.ca:80',
      username: 'openai',
      credential: 'openai123'
    }
  ]
};

class WebRTCManager {
  constructor() {
    this.peers = new Map(); // Store peer connections
    this.localStream = null;
    this.remoteStreams = new Map(); // Store remote video streams
    this.connectionStates = new Map(); // Track connection quality
    this.maxReconnectAttempts = 3;
    this.reconnectTimeouts = new Map();
    this.onStreamCallback = null; // Callback for when remote stream is received
    this.onConnectCallback = null; // Callback for when peer connects
  }

  // Check if devices are available
  async checkDeviceAvailability() {
    try {
      // Comprehensive WebRTC and getUserMedia support check
      const isWebRTCSupported = !!(
        window.RTCPeerConnection ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection
      );

      const hasGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );

      // Check if we're in a secure context (required for getUserMedia)
      const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      console.log('🔍 Browser Support Check:');
      console.log(`- WebRTC Supported: ${isWebRTCSupported}`);
      console.log(`- getUserMedia Available: ${hasGetUserMedia}`);
      console.log(`- Secure Context (HTTPS/Localhost): ${isSecureContext}`);
      console.log(`- User Agent: ${navigator.userAgent}`);

      if (!isWebRTCSupported) {
        console.warn('❌ WebRTC is not supported in this browser');
        return {
          hasVideo: false,
          hasAudio: false,
          isWebRTCSupported: false,
          isSecureContext,
          browserSupported: false,
          error: 'WebRTC not supported'
        };
      }

      if (!hasGetUserMedia) {
        console.warn('❌ getUserMedia is not supported in this browser');
        return {
          hasVideo: false,
          hasAudio: false,
          isWebRTCSupported: true,
          isSecureContext,
          browserSupported: false,
          error: 'getUserMedia not supported'
        };
      }

      if (!isSecureContext) {
        console.warn('❌ HTTPS required for camera/microphone access');
        return {
          hasVideo: false,
          hasAudio: false,
          isWebRTCSupported: true,
          isSecureContext: false,
          browserSupported: false,
          error: 'HTTPS required'
        };
      }

      // For mobile devices, be more lenient with device checking
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        console.log('📱 Mobile device detected - using simplified device checking');
        // On mobile, we'll assume devices are available and handle errors during actual access
        return {
          hasVideo: true,
          hasAudio: true,
          isWebRTCSupported: true,
          isSecureContext: true,
          isMobile: true,
          browserSupported: true
        };
      }

      // Try to enumerate devices (this might fail on some browsers)
      let devices = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch (deviceError) {
        console.warn('⚠️ Could not enumerate devices:', deviceError.message);
        // Some browsers block enumerateDevices until permission is granted
        return {
          hasVideo: true, // Assume available
          hasAudio: true, // Assume available
          isWebRTCSupported: true,
          isSecureContext: true,
          browserSupported: true,
          devicesEnumerated: false
        };
      }

      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');

      console.log(`📹 Video devices: ${hasVideo ? 'Available' : 'Not found'}`);
      console.log(`🎤 Audio devices: ${hasAudio ? 'Available' : 'Not found'}`);

      return {
        hasVideo,
        hasAudio,
        isWebRTCSupported: true,
        isSecureContext: true,
        browserSupported: true,
        devicesEnumerated: true
      };
    } catch (error) {
      console.error('❌ Error checking devices:', error);
      return {
        hasVideo: false,
        hasAudio: false,
        isWebRTCSupported: false,
        isSecureContext: false,
        browserSupported: false,
        error: error.message
      };
    }
  }

  // Initialize local media stream (camera + microphone)
  async initializeLocalStream(videoEnabled = true, audioEnabled = true) {
    try {
      // Check if getUserMedia is supported (with polyfill for older browsers and mobile)
      let getUserMedia = navigator.mediaDevices?.getUserMedia;

      if (!getUserMedia) {
        // Fallback for older browsers and mobile devices
        getUserMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia;
      }

      if (!getUserMedia) {
        throw new Error('Media access not supported. Please ensure you are using a modern browser and have granted camera/microphone permissions.');
      }

      // If stream already exists, stop it first to release the devices
      if (this.localStream) {
        console.log('⚠️ Existing stream found, releasing devices...');
        this.localStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
        this.localStream = null;
      }

      // Small delay to ensure devices are fully released
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🎥 Requesting media devices...');
      console.log(`Video: ${videoEnabled}, Audio: ${audioEnabled}`);

      // Mobile-friendly constraints with fallback
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      const constraints = {
        video: videoEnabled ? (isMobile ? {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        } : {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        }) : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      console.log('📱 Device constraints:', constraints);

      // Try modern API first, fallback to legacy
      let stream;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('📱 Using modern getUserMedia API');
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        console.log('📱 Using legacy getUserMedia API');
        // Legacy API fallback
        stream = await new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }

      this.localStream = stream;
      console.log('✅ Local stream initialized');
      console.log('Video tracks:', this.localStream.getVideoTracks().length);
      console.log('Audio tracks:', this.localStream.getAudioTracks().length);

      return this.localStream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);

      // Enhanced error handling with specific messages
      if (error.name === 'NotReadableError' || error.message.includes('Device in use')) {
        const enhancedError = new Error('Device in use');
        enhancedError.name = 'DeviceInUseError';
        enhancedError.originalError = error;
        enhancedError.message = 'Camera or microphone is already in use by another application or browser tab. Please close other applications using these devices and try again.';
        throw enhancedError;
      }

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        const enhancedError = new Error('Permission denied');
        enhancedError.name = 'PermissionDeniedError';
        enhancedError.originalError = error;
        enhancedError.message = 'Camera and microphone access was denied. Please allow permissions in your browser settings and refresh the page.';
        throw enhancedError;
      }

      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        const enhancedError = new Error('Devices not found');
        enhancedError.name = 'DevicesNotFoundError';
        enhancedError.originalError = error;
        enhancedError.message = 'No camera or microphone found. Please check your device connections.';
        throw enhancedError;
      }

      if (error.name === 'NotSupportedError') {
        const enhancedError = new Error('Not supported');
        enhancedError.name = 'NotSupportedError';
        enhancedError.originalError = error;
        enhancedError.message = 'Media access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.';
        throw enhancedError;
      }

      if (error.name === 'AbortError') {
        const enhancedError = new Error('Aborted');
        enhancedError.name = 'AbortError';
        enhancedError.originalError = error;
        enhancedError.message = 'Media access was cancelled. Please try again.';
        throw enhancedError;
      }

      throw error;
    }
  }

  // Create a peer connection with enhanced error handling and reconnection
  createPeer(userId, socket, roomId, initiator = false) {
    // Prevent duplicate peer creation
    if (this.peers.has(userId)) {
      console.log(`⚠️ Peer ${userId} already exists, skipping creation`);
      return this.peers.get(userId);
    }

    // Validate local stream before creating peer
    if (!this.localStream) {
      console.error(`❌ Cannot create peer ${userId}: local stream not available`);
      return null;
    }

    // Check if local stream has valid tracks
    const videoTracks = this.localStream.getVideoTracks();
    const audioTracks = this.localStream.getAudioTracks();

    if (videoTracks.length === 0 && audioTracks.length === 0) {
      console.error(`❌ Cannot create peer ${userId}: no valid tracks in local stream`);
      return null;
    }

    console.log(`🔗 Creating peer for ${userId} (initiator: ${initiator})`);
    console.log(`🔗 Local stream tracks: Video=${videoTracks.length}, Audio=${audioTracks.length}`);

    // Try different configurations to avoid the "code" property error
    const configurations = [
      // Configuration 1: Minimal config with basic STUN servers
      {
        initiator,
        stream: this.localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        },
        trickle: true
      },
      // Configuration 2: Full ICE servers
      {
        initiator,
        stream: this.localStream,
        config: ICE_SERVERS,
        trickle: true
      },
      // Configuration 3: With offer/answer options
      {
        initiator,
        stream: this.localStream,
        config: ICE_SERVERS,
        trickle: true,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        },
        answerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        }
      },
      // Configuration 4: No ICE servers (local only)
      {
        initiator,
        stream: this.localStream,
        config: {
          iceServers: []
        },
        trickle: false
      }
    ];

    let peer = null;
    let configIndex = 0;

    // Try each configuration until one works
    while (!peer && configIndex < configurations.length) {
      try {
        console.log(`🔧 Trying configuration ${configIndex + 1} for peer ${userId}`);
        console.log(`🔧 Config details:`, configurations[configIndex]);
        peer = new SimplePeer(configurations[configIndex]);
        console.log(`✅ Successfully created peer for ${userId} with configuration ${configIndex + 1}`);
        break;
      } catch (error) {
        console.warn(`⚠️ Configuration ${configIndex + 1} failed for peer ${userId}:`, error.message);
        console.warn(`⚠️ Error details:`, error);
        configIndex++;
      }
    }

    if (!peer) {
      console.error(`❌ All configurations failed for peer ${userId}`);
      return null;
    }

    // Initialize connection state
    this.connectionStates.set(userId, {
      connected: false,
      reconnectAttempts: 0,
      quality: 'unknown'
    });

    // Handle signaling data
    peer.on('signal', (data) => {
      console.log(`📡 [${userId}] Sending ${data.type} signal`, {
        candidate: data.candidate ? `${data.candidate.candidate.substring(0, 30)}...` : null,
        sdp: data.sdp ? `${data.sdp.substring(0, 50)}...` : null
      });
      console.log(`📡 [${userId}] Full signal data:`, data);
      socket.emit('signal', {
        roomId,
        targetUserId: userId,
        signal: data
      });
    });

    // Track ICE connection state
    peer.on('iceStateChange', (state) => {
      console.log(`🧊 [${userId}] ICE state: ${state}`);
    });

    // Track signaling state
    peer.on('signalStateChange', (state) => {
      console.log(`📶 [${userId}] Signal state: ${state}`);
    });

    // Track negotiation events
    peer.on('negotiate', () => {
      console.log(`🔄 [${userId}] Negotiation needed`);
    });

    // Handle incoming stream with error protection
    peer.on('stream', (stream) => {
      try {
        console.log(`📹 Received stream from ${userId}`);
        
        // Validate stream
        if (!stream || !stream.getTracks || stream.getTracks().length === 0) {
          console.warn(`⚠️ Invalid stream received from ${userId}`);
          return;
        }
        
        this.remoteStreams.set(userId, stream);

        // Update connection state
        const state = this.connectionStates.get(userId);
        if (state) {
          state.connected = true;
          state.quality = 'good';
        }

        // Trigger callback if set
        if (this.onStreamCallback) {
          this.onStreamCallback(userId, stream);
        }
      } catch (error) {
        console.error(`❌ Error handling stream from ${userId}:`, error);
      }
    });

    // Handle connection established
    peer.on('connect', () => {
      console.log(`✅ Connected to peer ${userId}`);
      console.log(`🔗 [${userId}] Peer connection established`);
      const state = this.connectionStates.get(userId);
      if (state) {
        state.connected = true;
        state.reconnectAttempts = 0; // Reset attempts on successful connection
        state.quality = 'good';
      }

      // Trigger connection callback
      if (this.onConnectCallback) {
        this.onConnectCallback(userId);
      }
    });

    peer.on('data', (data) => {
      console.log(`📊 [${userId}] Received data:`, data);
    });

    // Handle connection errors with improved error handling
    peer.on('error', (err) => {
      console.error(`❌ Peer error with ${userId}:`, err);
      console.error(`❌ Error name: ${err.name}, message: ${err.message}`);
      console.error(`❌ Error stack:`, err.stack);

      // Check for specific SimplePeer errors that shouldn't be retried
      const nonRetryableErrors = [
        'Cannot set property code',
        'Illegal invocation',
        'Invalid state',
        'Already connected',
        'InvalidAccessError',
        'NotSupportedError',
        'getter-only property'
      ];

      // Check for STUN server errors that should be retried with different config
      const stunServerErrors = [
        'not a valid stun or turn URL',
        'Failed to construct \'RTCPeerConnection\'',
        'STUN server error',
        'ICE server error'
      ];

      const isStunServerError = stunServerErrors.some(errorText =>
        err.message && err.message.includes(errorText)
      );

      const isNonRetryable = nonRetryableErrors.some(errorText =>
        err.message && err.message.includes(errorText)
      );

      if (isNonRetryable) {
        console.log(`❌ Non-retryable error for ${userId}: ${err.message}, removing peer`);
        this.removePeer(userId);
        
        // Update connection state to show error
        const state = this.connectionStates.get(userId);
        if (state) {
          state.connected = false;
          state.quality = 'error';
          state.error = err.message;
        }
        return;
      }

      // Handle STUN server errors with immediate retry using different config
      if (isStunServerError) {
        console.log(`🔄 STUN server error for ${userId}, trying with different configuration...`);
        this.removePeer(userId);
        
        // Try creating peer with minimal config immediately
        setTimeout(() => {
          console.log(`🔄 Retrying peer creation for ${userId} with minimal STUN config`);
          this.createPeer(userId, socket, roomId, initiator);
        }, 1000);
        return;
      }

      const state = this.connectionStates.get(userId);

      if (state && state.reconnectAttempts < this.maxReconnectAttempts) {
        state.reconnectAttempts++;
        console.log(`🔄 Attempting reconnection ${state.reconnectAttempts}/${this.maxReconnectAttempts} for ${userId}`);

        // Wait before retrying
        const timeoutId = setTimeout(() => {
          console.log(`🔄 Retrying connection to ${userId}`);
          this.removePeer(userId); // Clean up first
          this.createPeer(userId, socket, roomId, initiator);
        }, 2000 * state.reconnectAttempts); // Exponential backoff

        this.reconnectTimeouts.set(userId, timeoutId);
      } else {
        console.log(`❌ Max reconnection attempts reached for ${userId}, removing peer`);
        this.removePeer(userId);
      }
    });

    // Handle connection close
    peer.on('close', () => {
      console.log(`🔌 Connection closed with ${userId}`);
      const state = this.connectionStates.get(userId);
      if (state) {
        state.connected = false;
      }
      this.removePeer(userId);
    });

    // Monitor connection quality (basic implementation)
    peer.on('iceStateChange', (iceState) => {
      const state = this.connectionStates.get(userId);
      if (state) {
        if (iceState === 'connected' || iceState === 'completed') {
          state.quality = 'good';
        } else if (iceState === 'disconnected') {
          state.quality = 'poor';
        }
      }
    });

    this.peers.set(userId, peer);
    return peer;
  }

  // Add signal to existing peer with improved error handling
  addSignal(userId, signal) {
    const peer = this.peers.get(userId);
    if (!peer) {
      console.log(`❌ No peer found for ${userId} to add signal`);
      return;
    }

    // Validate signal before adding
    if (!signal || typeof signal !== 'object') {
      console.error(`❌ Invalid signal received for ${userId}:`, signal);
      return;
    }

    // Check if signal has required properties
    if (!signal.type && !signal.sdp && !signal.candidate) {
      console.error(`❌ Malformed signal received for ${userId}:`, signal);
      return;
    }

    // Additional validation for signal properties
    if (signal.type && !['offer', 'answer', 'pranswer', 'rollback'].includes(signal.type)) {
      console.warn(`⚠️ Unknown signal type for ${userId}: ${signal.type}`);
    }

    try {
      console.log(`📡 Adding ${signal.type || 'unknown'} signal to peer ${userId}`);
      console.log(`📡 Peer state:`, {
        destroyed: peer.destroyed,
        readyState: peer._pc ? peer._pc.readyState : 'no pc',
        connectionState: peer._pc ? peer._pc.connectionState : 'no pc'
      });
      
      // Check if peer is in a valid state for signaling
      if (peer.destroyed) {
        console.warn(`⚠️ Peer ${userId} is destroyed, cannot add signal`);
        return;
      }

      peer.signal(signal);
      console.log(`✅ Signal successfully added to peer ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to add signal to peer ${userId}:`, error);
      console.error(`❌ Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.error(`❌ Signal that caused error:`, signal);

      // Check if it's the specific "code" property error
      if (error.message && error.message.includes('Cannot set property code')) {
        console.log(`❌ Detected "code" property error, removing peer to prevent further issues`);
        this.removePeer(userId);
        return;
      }

      // For other errors, try to recover
      if (error.message && error.message.includes('Invalid state')) {
        console.log(`❌ Invalid state error, removing peer`);
        this.removePeer(userId);
        return;
      }

      // If signaling fails with other errors, remove the peer to prevent further issues
      this.removePeer(userId);
    }
  }

  // Remove a peer connection with cleanup
  removePeer(userId) {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.destroy();
      this.peers.delete(userId);
    }

    this.remoteStreams.delete(userId);
    this.connectionStates.delete(userId);

    // Clear any pending reconnection timeouts
    const timeoutId = this.reconnectTimeouts.get(userId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.reconnectTimeouts.delete(userId);
    }

    if (this.onStreamRemovedCallback) {
      this.onStreamRemovedCallback(userId);
    }
  }

  // Toggle video
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle audio
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Get remote stream
  getRemoteStream(userId) {
    return this.remoteStreams.get(userId);
  }

  // Set callback for new streams
  onStream(callback) {
    this.onStreamCallback = callback;
  }

  // Set callback for removed streams
  onStreamRemoved(callback) {
    this.onStreamRemovedCallback = callback;
  }

  // Get connection status for a peer
  getConnectionStatus(userId) {
    return this.connectionStates.get(userId) || { connected: false, quality: 'unknown', reconnectAttempts: 0 };
  }

  // Get all connection statuses
  getAllConnectionStatuses() {
    const statuses = {};
    for (const [userId, state] of this.connectionStates.entries()) {
      statuses[userId] = state;
    }
    return statuses;
  }

  // Set callback for connection established
  onConnect(callback) {
    this.onConnectCallback = callback;
  }

  // Replace local stream (useful for screen sharing)
  replaceStream(newStream) {
    console.log('🔄 Replacing local stream for all peers');
    this.localStream = newStream;

    // Update stream for all existing peers
    for (const [userId, peer] of this.peers.entries()) {
      if (peer && peer.stream !== newStream) {
        peer.replaceTrack(peer.stream.getVideoTracks()[0], newStream.getVideoTracks()[0], newStream);
        peer.replaceTrack(peer.stream.getAudioTracks()[0], newStream.getAudioTracks()[0], newStream);
        console.log(`🔄 Updated stream for peer ${userId}`);
      }
    }
  }

  // Start screen sharing
  async startScreenShare() {
    try {
      console.log('🖥️ Requesting screen share...');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing not supported in this browser');
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      });

      // Handle when user stops sharing via browser UI
      screenStream.getVideoTracks()[0].onended = () => {
        console.log('🖥️ Screen share ended by user');
        this.stopScreenShare();
        if (this.onScreenShareEndCallback) {
          this.onScreenShareEndCallback();
        }
      };

      // Replace the local stream with screen share
      this.replaceStream(screenStream);
      console.log('✅ Screen share started successfully');

      return screenStream;
    } catch (error) {
      console.error('❌ Screen share error:', error);
      throw error;
    }
  }

  // Stop screen sharing
  stopScreenShare() {
    console.log('🖥️ Stopping screen share...');

    if (this.localStream && this.localStream.getVideoTracks().some(track => track.label.includes('screen'))) {
      this.localStream.getTracks().forEach(track => track.stop());

      // Reinitialize camera stream
      this.initializeLocalStream(true, true).then(newStream => {
        this.replaceStream(newStream);
      }).catch(error => {
        console.error('❌ Failed to restore camera after screen share:', error);
      });
    }
  }

  // Set callback for screen share end
  onScreenShareEnd(callback) {
    this.onScreenShareEndCallback = callback;
  }

  // Clean up all connections
  cleanup() {
    console.log('🧹 Cleaning up WebRTC connections...');

    this.peers.forEach((peer, userId) => {
      console.log(`Destroying peer: ${userId}`);
      peer.destroy();
    });
    this.peers.clear();
    this.remoteStreams.clear();
    this.connectionStates.clear();

    // Clear all reconnection timeouts
    this.reconnectTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.reconnectTimeouts.clear();

    if (this.localStream) {
      console.log('Stopping local stream tracks...');
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      this.localStream = null;
    }

    console.log('✅ Cleanup complete');
  }

  // Set callback for when remote stream is received
  setOnStreamCallback(callback) {
    this.onStreamCallback = callback;
  }

  // Set callback for when peer connects
  setOnConnectCallback(callback) {
    this.onConnectCallback = callback;
  }
}

export default new WebRTCManager();
