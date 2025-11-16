import { io } from 'socket.io-client';
import { config } from '../configure';

// Connect to the Socket.IO server
const getServerURL = () => {
  // Use config for now (ignore localStorage)
  return config.SOCKET_URL;
};

const SOCKET_SERVER_URL = getServerURL();
console.log('🔌 Socket.IO server URL:', SOCKET_SERVER_URL);

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    console.log('🔌 Initializing Socket.IO connection to:', SOCKET_SERVER_URL);
    
    socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server:', socket.id);
      console.log('🔌 Socket transport:', socket.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('Error details:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to server after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to server');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
