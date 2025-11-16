// API Configuration for dynamic server URL detection
// This allows the app to work on localhost, local network, and production

const getAPIBaseURL = () => {
  // Check localStorage for configured backend URL
  const configuredBackend = localStorage.getItem('VITE_API_URL');
  return configuredBackend || 'https://meeting-backend-glfz.onrender.com';
};

const API_BASE_URL = getAPIBaseURL();
export default API_BASE_URL;

// API Endpoints - these will use the configured backend URL
export const API_ENDPOINTS = {
  ROOM_CREATE: `${API_BASE_URL}/api/room/create`,
  ROOM_JOIN: `${API_BASE_URL}/api/room/join`,
  ROOM_LEAVE: `${API_BASE_URL}/api/room/leave`,
  ROOM_END: `${API_BASE_URL}/api/room/end`,
  CHAT_HISTORY: (roomId) => `${API_BASE_URL}/api/chat-history/${roomId}`,
  CHATBOT: `${API_BASE_URL}/api/chatbot`,
  GLOBAL_SEARCH: `${API_BASE_URL}/api/global-search`,
  TEST_GEMINI: `${API_BASE_URL}/api/test-gemini`
};
