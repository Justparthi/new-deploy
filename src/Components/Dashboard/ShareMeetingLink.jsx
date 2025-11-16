import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, CheckIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const ShareMeetingLink = ({ roomId }) => {
  const [copied, setCopied] = useState(false);
  const [localIP, setLocalIP] = useState('');
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);

  useEffect(() => {
    // Try to detect local IP (works in some browsers)
    detectLocalIP();
  }, []);

  const detectLocalIP = async () => {
    try {
      // This is a workaround to get local IP in browser
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const ipMatch = ipRegex.exec(ice.candidate.candidate);
        if (ipMatch) {
          const detectedIP = ipMatch[1];
          // Filter out 0.0.0.0 and prefer 192.168.x.x or 10.x.x.x
          if (detectedIP !== '0.0.0.0' && 
              (detectedIP.startsWith('192.168.') || 
               detectedIP.startsWith('10.') || 
               detectedIP.startsWith('172.'))) {
            setLocalIP(detectedIP);
            pc.close();
          }
        }
      };
    } catch (error) {
      console.log('Could not auto-detect IP:', error);
    }
  };

  const getShareableLink = () => {
    if (!roomId) return '';
    
    // If we detected a local IP, use it
    if (localIP) {
      return `http://${localIP}:5173/room/${roomId}`;
    }
    
    // Otherwise use the current origin
    return `${window.location.origin}/room/${roomId}`;
  };

  const getMobileShareableLink = () => {
    if (!roomId) return '';
    return `http://YOUR_IP_HERE:5173/room/${roomId}`;
  };

  const copyToClipboard = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = getShareableLink();
  const isLocalhost = shareLink.includes('localhost');

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <DevicePhoneMobileIcon className="h-5 w-5" />
        Share Meeting Link
      </h3>

      {/* Current Link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {isLocalhost ? 'Desktop Link (This Computer Only)' : 'Meeting Link'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
          />
          <button
            onClick={() => copyToClipboard(shareLink)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckIcon className="h-5 w-5" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-5 w-5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Instructions */}
      {isLocalhost && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <DevicePhoneMobileIcon className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-2">
                📱 To Share with Friends on Phone:
              </h4>
              
              <div className="space-y-2 text-sm text-amber-800">
                <div className="bg-white rounded p-3 space-y-2">
                  <p className="font-semibold">Option 1: Same WiFi Network</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Find your computer's IP address:
                      <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                        <li>Windows: Open Command Prompt → type <code className="bg-gray-100 px-1 rounded">ipconfig</code></li>
                        <li>Look for "IPv4 Address" (e.g., 192.168.1.100)</li>
                      </ul>
                    </li>
                    <li>Replace <code className="bg-gray-100 px-1 rounded">localhost</code> with your IP</li>
                    <li>Example: <code className="bg-gray-100 px-1 rounded">http://192.168.1.100:5173/room/{roomId}</code></li>
                    <li>Share this link with friends on the same WiFi</li>
                  </ol>
                </div>

                <div className="bg-white rounded p-3 space-y-2">
                  <p className="font-semibold">Option 2: Deploy Online (Recommended)</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Deploy to Vercel, Netlify, or Render</li>
                    <li>Get a public URL (e.g., https://shortmeet.vercel.app)</li>
                    <li>Share with anyone, anywhere</li>
                  </ol>
                </div>
              </div>

              {localIP && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    ✅ Detected Local IP:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`http://${localIP}:5173/room/${roomId}`}
                      readOnly
                      className="flex-1 px-2 py-1 border border-green-300 rounded bg-white text-xs font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(`http://${localIP}:5173/room/${roomId}`)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Share this link with friends on the same WiFi network
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Copy Button for Mobile Link */}
      {localIP && (
        <button
          onClick={() => copyToClipboard(`http://${localIP}:5173/room/${roomId}`)}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <DevicePhoneMobileIcon className="h-5 w-5" />
          Copy Mobile-Friendly Link
        </button>
      )}
    </div>
  );
};

export default ShareMeetingLink;
