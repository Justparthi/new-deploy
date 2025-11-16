import { useState, useEffect, useRef } from 'react'
import './Chat.css'
import Messages from './Messages'
import IntegratedChatbot from './IntegratedChatbot'
import ChatbotDemo from './ChatbotDemo'

export default function Chat() {
    const [chatmsgs, setChatmsgs] = useState([
        {
            name: "AI Assistant 🤖",
            message: "Hello! I'm your AI-powered assistant with global search capabilities. Type '@bot' followed by your question to ask me anything:\n\n• Meeting controls & troubleshooting\n• General knowledge & current events\n• How-to guides & tutorials\n• Facts & information on any topic\n\nWhat would you like to know?",
            isBot: true,
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Chatbot integration
    const handleBotMessage = (botMessage) => {
        setChatmsgs(prev => [...prev, botMessage]);
    };

    const { handleBotQuery } = IntegratedChatbot({ onSendMessage: handleBotMessage });

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatmsgs, isBotTyping]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            name: "You",
            message: inputMessage,
            isBot: false,
            timestamp: new Date().toISOString()
        };

        setChatmsgs(prev => [...prev, userMessage]);

        // Check if message is for the bot
        if (inputMessage.toLowerCase().startsWith('@bot')) {
            const botQuery = inputMessage.substring(4).trim();
            setIsBotTyping(true);
            await handleBotQuery(botQuery);
            setIsBotTyping(false);
        }

        setInputMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleDemoQuerySelect = (query) => {
        setInputMessage(query);
    };

    return (
        <div className="h-screen flex flex-col" style={{background: 'rgba(26, 26, 46, 0.95)'}}>
            <div className='p-4 border-b border-white/10 text-white flex justify-between items-center glass-effect'>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-lg">Chat</h3>
                </div>
                <div className="flex items-center gap-3">
                    <ChatbotDemo onQuerySelect={handleDemoQuerySelect} />
                    <span className='text-xs text-gray-400 px-2 py-1 rounded-lg glass-effect'>Type @bot for AI</span>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                {chatmsgs.map((chat, index) =>
                    <Messages
                        name={chat.name}
                        message={chat.message}
                        isBot={chat.isBot}
                        key={index}
                    />
                )}
                {isBotTyping && (
                    <div className="flex items-center gap-2 p-3 text-purple-300 text-sm glass-effect rounded-xl w-fit">
                        <div className="flex gap-1">
                            <span className="animate-bounce" style={{animationDelay: '0ms'}}>●</span>
                            <span className="animate-bounce" style={{animationDelay: '150ms'}}>●</span>
                            <span className="animate-bounce" style={{animationDelay: '300ms'}}>●</span>
                        </div>
                        <span>AI is thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="w-full flex justify-center items-center p-4 border-t border-white/10 glass-effect">
                <div className="relative outline-0 rounded-xl shadow-sm flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="message"
                        id="message"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="block text-sm w-full outline-0 rounded-xl border-0 py-3 pl-12 pr-4 text-white glass-effect placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 sm:text-sm"
                        placeholder="Message or @bot for AI help"
                        style={{background: 'rgba(255, 255, 255, 0.05)'}}
                    />
                </div>
                <button 
                    onClick={handleSendMessage}
                    className='px-4 py-3 rounded-xl ms-2 transition-all duration-300 transform hover:scale-105 shadow-lg'
                    style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="send">
                            <path id="Vector" d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path id="Vector_2" d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </button>
            </div>
        </div>
    )
}
