// Local development configuration
export const config = {
  API_BASE_URL: import.meta.env?.VITE_BACKEND_URL || "https://meeting-backend-glfz.onrender.com",
  SOCKET_URL: (import.meta.env?.VITE_BACKEND_URL?.replace(/^http/, 'ws')) || "ws://localhost:3001"
};

// When using ngrok frontend:
// 1. Keep these as localhost
// 2. Run backend normally
// 3. Only expose frontend via ngrok
