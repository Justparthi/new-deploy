import { useState } from 'react';
import axios from 'axios';

const IntegratedChatbot = ({ onSendMessage }) => {
    const [isTyping, setIsTyping] = useState(false);

    // Your working Gemini API key from chartbot
    const GEMINI_API_KEY = "AIzaSyDdoCQrg78Le-hDJtqKAjJ0tGYYf7tbY6g";

    const handleBotQuery = async (message) => {
        setIsTyping(true);
        
        // Simulate typing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let botResponse;

        try {
            // Direct Gemini API call (same as your chartbot)
            console.log('[Chatbot] Sending query directly to Gemini API:', message);
            
            const response = await axios({
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                method: 'post',
                data: {
                    contents: [
                        {
                            parts: [
                                {
                                    text: message
                                }
                            ]
                        }
                    ]
                }
            });

            botResponse = response.data.candidates[0].content.parts[0].text;
            console.log('[Chatbot] Response received successfully');
            
        } catch (error) {
            console.error('[Chatbot] Error:', error);
            
            // Provide user-friendly error messages
            if (error.response?.status === 429 || error.message.includes('RESOURCE_EXHAUSTED')) {
                botResponse = `⏱️ **API Rate Limit Reached**\n\nThe free tier allows 15 requests per minute.\n\nPlease wait 10-15 seconds and try again.\n\n**Tip:** Consider upgrading to a paid plan for higher limits.`;
            } else if (error.response?.status === 403 || error.response?.status === 401) {
                botResponse = `🔑 **Invalid API Key**\n\nThe API key may have expired or been revoked.\n\nPlease:\n1. Visit https://aistudio.google.com/app/apikey\n2. Create a NEW key\n3. Update the key in IntegratedChatbot.jsx\n4. Refresh the page`;
            } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                botResponse = `🌐 **Network Error**\n\nCannot connect to Gemini API.\n\n**Check:**\n• Internet connection is working\n• No firewall blocking Google APIs\n• Try again in a moment`;
            } else {
                botResponse = `❌ **AI Service Error**\n\n${error.message}\n\n**Troubleshooting:**\n• Check internet connection\n• Try refreshing the page\n• Wait a moment and try again`;
            }
        }
        
        setIsTyping(false);
        
        // Send bot response to chat
        onSendMessage({
            name: "AI Assistant 🤖",
            message: botResponse,
            isBot: true,
            timestamp: new Date().toISOString()
        });
    };

    return {
        handleBotQuery,
        isTyping
    };
};

export default IntegratedChatbot;
