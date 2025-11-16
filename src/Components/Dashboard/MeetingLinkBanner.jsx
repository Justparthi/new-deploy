import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const MeetingLinkBanner = ({ roomCode, meetingId, roomName, hostName, meetingLink }) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Debug logging
  console.log('🔗 MeetingLinkBanner props:', {
    roomCode,
    meetingId,
    roomName,
    hostName,
    meetingLink
  });

  const handleCopy = async () => {
    console.log('📋 Copy button clicked');
    console.log('📋 Meeting link to copy:', meetingLink);
    console.log('📋 Room code:', roomCode);
    console.log('📋 Current origin:', window.location.origin);
    
    if (!meetingLink) {
      console.error('❌ No meeting link available to copy');
      alert('No meeting link available. Please wait for the room to be created.');
      return;
    }
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(meetingLink);
        console.log('✅ Link copied to clipboard successfully using modern API');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        console.log('📋 Using fallback copy method');
        fallbackCopyTextToClipboard(meetingLink);
      }
    } catch (err) {
      console.error('❌ Failed to copy to clipboard:', err);
      // Fallback to text selection
      fallbackCopyTextToClipboard(meetingLink);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('✅ Link copied using fallback method');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('❌ Fallback copy failed');
      }
    } catch (err) {
      console.error('❌ Fallback copy error:', err);
    }
    
    document.body.removeChild(textArea);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      url: `https://wa.me/?text=${encodeURIComponent(`Join my meeting: ${meetingLink}`)}`
    },
    {
      name: 'Email',
      icon: '📧',
      url: `mailto:?subject=${encodeURIComponent(`Meeting Invitation: ${roomName}`)}&body=${encodeURIComponent(`You're invited to join: ${roomName}\n\nMeeting Link: ${meetingLink}\n\nRoom Code: ${roomCode}\n\nHost: ${hostName}`)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(meetingLink)}&text=${encodeURIComponent(`Join my meeting: ${roomName}`)}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join my meeting: ${roomName}`)}&url=${encodeURIComponent(meetingLink)}`
    }
  ];

  return (
    <>
      {/* Meeting Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">{roomName}</span>
            </div>
            <div className="hidden sm:block text-blue-200">•</div>
            <div className="text-sm text-blue-200">
              Room Code: <span className="font-mono font-bold">{roomCode}</span>
            </div>
            <div className="hidden sm:block text-blue-200">•</div>
            <div className="text-sm text-blue-200">
              Host: <span className="font-semibold">{hostName}</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Share Meeting</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Meeting Link</div>
                <div className="font-mono text-sm break-all">{meetingLink}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Room Code</div>
                <div className="font-mono text-lg font-bold">{roomCode}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.name}</span>
                  </a>
                ))}
              </div>
              
              <button 
                onClick={handleCopy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Meeting Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingLinkBanner;