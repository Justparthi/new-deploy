import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GlobalSearchAI = () => {
  const GEMINI_API_KEY = "AIzaSyDdoCQrg78Le-hDJtqKAjJ0tGYYf7tbY6g";

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message:
        "👋 Hello! I’m your AI-powered global search assistant.\n\nAsk me anything like:\n• \"Latest tech news\"\n• \"Weather in London\"\n• \"Explain quantum physics\"\n• \"Best way to learn React?\"",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---------------------------
  // GEMINI SEARCH FUNCTION
  // ---------------------------
  const searchGlobally = async (query) => {
    setIsLoading(true);

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        method: 'post',
        data: {
          contents: [
            {
              parts: [{ text: query }],
            },
          ],
        },
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error.response?.status === 429) {
        return `⏱️ Rate limit reached. Please wait 10 seconds and try again.`;
      }
      if (error.response?.status === 403 || error.response?.status === 401) {
        return `🔑 Invalid API Key. Please generate a new key at aistudio.google.com.`;
      }
      return `❌ Search Error: ${error.message}`;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  // SEND MESSAGE
  // ---------------------------
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    const query = inputMessage;
    setInputMessage('');

    // Typing Indicator
    const typingMsg = {
      id: Date.now() + 1,
      type: 'ai',
      message: 'Searching...',
      isTyping: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, typingMsg]);

    const aiResponse = await searchGlobally(query);

    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.isTyping);
      return [
        ...filtered,
        {
          id: Date.now() + 2,
          type: 'ai',
          message: aiResponse,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-base font-semibold text-white flex items-center">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Global AI Search
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Ask anything. Search the world.
        </p>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                msg.type === 'user'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {/* AI Label */}
              {msg.type === 'ai' && !msg.isTyping && (
                <p className="text-xs font-medium text-purple-400 mb-1">
                  AI Assistant
                </p>
              )}

              {/* Typing Animation */}
              {msg.isTyping ? (
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">Searching…</span>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.type === 'user'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-800 bg-gray-900"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2.5 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-40 transition-colors"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isLoading ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              )}
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalSearchAI;
