import { useState, useEffect, useRef, useContext } from 'react';
import { DashboardStateContext } from '../../../Utils/DashboardStateProvider';
import { getSocket } from '../../../Utils/socket';

const ParticipantChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { roomId, userId, userName } = useContext(DashboardStateContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    const socket = getSocket();
    
    const handleMessage = (data) => {
      console.log('💬 Received chat message:', data);
      // Only add if it's from someone else
      if (data.userId !== userId) {
        console.log('💬 Adding message from other user:', data.userName);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(), // Unique ID
          userId: data.userId,
          userName: data.userName || `User-${data.userId.slice(-6)}`,
          message: data.message,
          timestamp: data.timestamp,
          isOwn: false
        }]);
      } else {
        console.log('💬 Ignoring message from self');
      }
    };
    
    socket.on('receive-message', handleMessage);

    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [userId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const socket = getSocket();
    const messageData = {
      roomId,
      userId,
      userName: userName || `User-${userId.slice(-6)}`,
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    console.log('💬 Sending chat message:', messageData);

    // Add message locally first (optimistic update)
    setMessages(prev => [...prev, {
      id: Date.now(),
      userId: userId,
      userName: userName || `User-${userId.slice(-6)}`,
      message: inputMessage,
      timestamp: messageData.timestamp,
      isOwn: true
    }]);

    // Send to server (will broadcast to others only)
    socket.emit('send-message', messageData);
    console.log('💬 Message sent to server');
    setInputMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-base font-semibold text-white flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          Participant Chat
        </h2>
        <p className="text-xs text-gray-500 mt-1">Chat with meeting participants</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center text-sm">No messages yet</p>
            <p className="text-xs text-center mt-1 text-gray-600">Start a conversation with participants</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  msg.isOwn
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {!msg.isOwn && (
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    {msg.userName}
                  </p>
                )}
                <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${msg.isOwn ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2.5 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantChat;