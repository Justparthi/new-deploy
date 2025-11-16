# MeetSphere - Professional Video Conferencing Platform

A modern, secure, and feature-rich video conferencing platform built with React, Node.js, Socket.IO, and WebRTC.

## 🚀 Features

- **Real-time Video/Audio**: High-quality WebRTC-based video and audio communication
- **Room Management**: Create and join meeting rooms with unique codes
- **Screen Sharing**: Share your screen with other participants
- **Chat System**: Real-time text chat with AI-powered chatbot
- **Mobile Support**: Works seamlessly on desktop and mobile devices
- **MongoDB Integration**: Persistent room and chat data storage
- **Password Protection**: Secure rooms with password authentication
- **Cross-platform**: Works on Windows, Mac, Linux, iOS, and Android

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (optional - works without database)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Shortmeet-master
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd ..
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create a `server/config.env` file:
```env
# MongoDB Configuration (Optional)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shortmeet?retryWrites=true&w=majority

# Server Port
PORT=3001

# AI API Keys (Optional - for chatbot features)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
```

#### Frontend Environment (.env)
Create a `.env` file in the root directory:
```env
# API Configuration
VITE_API_URL=https://meeting-backend-glfz.onrender.com
VITE_SOCKET_URL=https://meeting-backend-glfz.onrender.com
```

### 4. Database Setup (Optional)

The application works without MongoDB, but for persistent data storage:

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to `server/config.env`

## 🚀 Running the Application

### Option 1: Quick Start (Windows)
```bash
# Run the batch file to start both servers
start-servers.bat
```

### Option 2: Manual Start

#### Start Backend Server
```bash
cd server
npm start
```

#### Start Frontend Server (in a new terminal)
```bash
npm run dev
```

### Option 3: Development Mode
```bash
# Backend with auto-restart
cd server
npm run dev

# Frontend with hot reload
npm run dev
```

## 🌐 Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: https://meeting-backend-glfz.onrender.com
- **Network Access**: Use your computer's IP address for other devices

## 📱 Mobile & Network Access

### For Mobile Devices:
1. Find your computer's IP address
2. Access: `http://YOUR_IP:5173`
3. Ensure both devices are on the same network

### For External Access:
1. Use ngrok or similar tunneling service
2. Configure the tunnel URL in environment variables

## 🔧 Configuration

### API Endpoints
- `POST /api/room/create` - Create new room
- `POST /api/room/join` - Join existing room
- `POST /api/room/leave` - Leave room
- `GET /api/room/:roomCode` - Get room info
- `POST /api/chatbot` - AI chatbot
- `POST /api/global-search` - Global AI search

### Socket.IO Events
- `join-room` - Join a meeting room
- `user-connected` - New user joined
- `user-disconnected` - User left
- `signal` - WebRTC signaling
- `toggle-camera` - Camera state change
- `toggle-mic` - Microphone state change
- `send-message` - Chat message

## 🛡️ Security Features

- Password-protected rooms
- HTTPS support for production
- CORS configuration
- Input validation
- Rate limiting for API calls

## 🐛 Troubleshooting

### Common Issues:

1. **Camera/Microphone not working**
   - Ensure HTTPS or localhost access
   - Check browser permissions
   - Try refreshing the page

2. **Socket.IO connection failed**
   - Check if backend server is running
   - Verify firewall settings
   - Check network connectivity

3. **MongoDB connection issues**
   - Verify connection string
   - Check IP whitelist in MongoDB Atlas
   - App works without database

4. **WebRTC connection failed**
   - Check firewall settings
   - Ensure STUN/TURN servers are accessible
   - Try different network

### Browser Compatibility:
- Chrome (Recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📁 Project Structure

```
Shortmeet-master/
├── server/                 # Backend server
│   ├── database/           # MongoDB models
│   ├── ssl/               # SSL certificates
│   ├── index.js           # Main server file
│   └── package.json       # Backend dependencies
├── src/                   # Frontend React app
│   ├── Components/        # React components
│   ├── hooks/            # Custom hooks
│   ├── Utils/            # Utilities
│   └── main.jsx          # App entry point
├── public/               # Static assets
├── package.json          # Frontend dependencies
└── vite.config.js        # Vite configuration
```

## 🤖 AI Features

The platform includes AI-powered features:
- Meeting assistant chatbot
- Global search functionality
- Support for OpenAI, Google Gemini, and Claude APIs

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the console logs
- Ensure all dependencies are installed
- Verify environment configuration

---

**Enjoy your video conferencing experience with MeetSphere! 🎉**"# meeting" 
"# meet-frontend" 
"# new-deploy" 
