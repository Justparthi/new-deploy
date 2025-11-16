import { useState } from 'react';

/**
 * Chatbot Demo Component
 * Shows example queries users can try with the chatbot
 */
const ChatbotDemo = ({ onQuerySelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const exampleQueries = [
        {
            category: "🎥 Meeting Controls",
            queries: [
                "How do I turn on my camera?",
                "How to share my screen?",
                "How do I mute my microphone?",
                "Screen sharing not working"
            ]
        },
        {
            category: "🔧 Troubleshooting",
            queries: [
                "My camera isn't working",
                "Audio quality is poor",
                "Connection issues",
                "Video is freezing"
            ]
        },
        {
            category: "👥 Participants",
            queries: [
                "How do I invite participants?",
                "How to remove a participant?",
                "Can't see other participants",
                "How to manage permissions?"
            ]
        },
        {
            category: "⚙️ Features",
            queries: [
                "How to record the meeting?",
                "What are the keyboard shortcuts?",
                "Meeting etiquette tips",
                "Browser compatibility"
            ]
        }
    ];

    const handleQueryClick = (query) => {
        onQuerySelect(`@bot ${query}`);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                title="See example queries"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                Examples
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Popup */}
                    <div className="absolute bottom-full mb-2 right-0 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto custom-scrollbar">
                        <div className="p-3 border-b border-gray-700 sticky top-0 bg-gray-800">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-white">Try asking:</h4>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-2">
                            {exampleQueries.map((category, idx) => (
                                <div key={idx} className="mb-3">
                                    <h5 className="text-xs font-semibold text-gray-400 mb-2 px-2">
                                        {category.category}
                                    </h5>
                                    <div className="space-y-1">
                                        {category.queries.map((query, qIdx) => (
                                            <button
                                                key={qIdx}
                                                onClick={() => handleQueryClick(query)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                {query}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-3 border-t border-gray-700 bg-gray-850">
                            <p className="text-xs text-gray-500 text-center">
                                Click any question to ask the bot
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatbotDemo;
