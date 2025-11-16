// client/src/Home/Home.jsx
import './Home.css'
import Navbar from '../Components/Navbar/Navbar'
import Troubleshoot from '../Components/Troubleshoot/Troubleshoot'
import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../Utils/StateProvider'
import NewRoom from '../Components/NewRoom/NewRoom'
import { useAuth } from '../Utils/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const { isTroublshootActive, setTroubleshoot } = useContext(StateContext);
    const { newMeeting, setNewMeeting } = useContext(StateContext);
    const [isNew, setIsNew] = useState("new");
    const [isOpen, setIsOpen] = useState(true)
    const [browserSupported, setBrowserSupported] = useState(true);
    const [browserError, setBrowserError] = useState('');
    const [showBrowserWarning, setShowBrowserWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Check browser compatibility on mount
    useEffect(() => {
        const checkBrowserSupport = () => {
            const hasWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
            const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
            
            const isLocalNetworkIP = () => {
                const hostname = window.location.hostname;
                const localIPRegex = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
                return localIPRegex.test(hostname);
            };
            
            const isSecure = window.location.protocol === 'https:' ||
                            window.location.hostname === 'localhost' ||
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('ngrok') ||
                            window.location.hostname.includes('localhost') ||
                            isLocalNetworkIP();

            if (!hasWebRTC) {
                setBrowserSupported(false);
                setBrowserError('WebRTC is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
                setShowBrowserWarning(true);
            } else if (!hasGetUserMedia) {
                setBrowserSupported(false);
                setBrowserError('Camera and microphone access is not available in this browser.');
                setShowBrowserWarning(true);
            } else if (!isSecure) {
                setBrowserSupported(false);
                setBrowserError('HTTPS is required for camera/microphone access. Please use HTTPS or localhost.');
                setShowBrowserWarning(true);
            }
        };

        checkBrowserSupport();
    }, []);

    const handleClick = (status) => {
        if (!browserSupported) {
            setShowBrowserWarning(true);
            return;
        }
        setIsLoading(true);
        setNewMeeting(true);
        setIsNew(status);
        
        setTimeout(() => {
            setIsLoading(false);
            openModal();
        }, 500);
    }

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    const onModalClose = (data) => {
        setIsOpen(data);
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            {/* User Info Bar */}
            {currentUser && (
                <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {currentUser.displayName || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">{currentUser.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            )}

            <Navbar />

            {/* Browser Compatibility Warning */}
            {showBrowserWarning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Browser Not Supported</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">{browserError}</p>
                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                            <p className="text-sm font-semibold text-blue-900 mb-3">Recommended browsers:</p>
                            <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Chrome (Desktop/Mobile)
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Firefox (Desktop/Mobile)
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Safari (iOS/Mac)
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Edge (Desktop)
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBrowserWarning(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                            >
                                Continue Anyway
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="relative max-w-7xl mx-auto pt-20 px-4 sm:pt-24 lg:pt-32 pb-20">
                {/* Hero Section */}
                <div className="text-center space-y-12">
                    {/* Main Heading */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Free for everyone • Secure & Private
                        </div>
                        
                        <h1 className='font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight text-gray-900 leading-tight max-w-6xl mx-auto'>
                            Connect with{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                crystal clarity
                            </span>
                        </h1>
                        
                        <p className='text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
                            Professional video meetings made simple. Secure, fast, and reliable — 
                            start connecting in seconds, not minutes.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        <button
                            className="group relative w-full sm:w-auto overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            onClick={() => handleClick('new')}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-6 h-6 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Start New Meeting
                                </>
                            )}
                        </button>
                        
                        <button
                            className="group w-full sm:w-auto bg-white text-gray-700 py-4 px-8 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 font-semibold text-lg border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow-lg"
                            onClick={() => handleClick('join')}
                            disabled={isLoading}
                        >
                            <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Join with Code
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-bold text-gray-900 mb-2">HD Video</div>
                            <div className="text-gray-600">Crystal clear 1080p quality</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-bold text-gray-900 mb-2">Unlimited</div>
                            <div className="text-gray-600">No time restrictions</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-3xl font-bold text-gray-900 mb-2">Secure</div>
                            <div className="text-gray-600">End-to-end encryption</div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
                        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                            <p className="text-gray-600 leading-relaxed">Your meetings are protected with enterprise-grade security and end-to-end encryption.</p>
                        </div>

                        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                            <p className="text-gray-600 leading-relaxed">Optimized for speed with minimal latency and instant connection to your meetings.</p>
                        </div>

                        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Collaboration</h3>
                            <p className="text-gray-600 leading-relaxed">Share screens, chat in real-time, and work together seamlessly with built-in tools.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-32 pt-12 border-t border-gray-200/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">MeetSphere</span>
                    </div>
                    <p className='text-gray-500 text-sm'>
                        © 2025 MeetSphere. Professional Video Conferencing Platform
                    </p>
                </div>
            </div>
            
            {newMeeting && <NewRoom status={isNew} onModalClose={onModalClose} />}
            {isTroublshootActive && <Troubleshoot />}
        </div>
    )
}