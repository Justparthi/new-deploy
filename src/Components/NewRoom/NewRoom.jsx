// client/src/Components/NewRoom/NewRoom.jsx
import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import './NewRoom.css'
import { StateContext } from '../../Utils/StateProvider';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { config } from '../../configure';
import { useAuth } from '../../Utils/AuthContext';

const API_BASE_URL = config.API_BASE_URL;

export default function NewRoom({ status, onModalClose }) {
    const { setNewMeeting } = useContext(StateContext);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Pre-fill username from authenticated user
    const [formData, setFormData] = useState({
        roomName: "",
        roomCode: "",
        username: currentUser?.displayName || currentUser?.email?.split('@')[0] || "",
        password: "",
        confirmPassword: "",
        status: status
    });

    const ModalCloseDataToParent = useCallback(() => {
        onModalClose(false);
        setNewMeeting(false);   
    }, [onModalClose, setNewMeeting]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        ModalCloseDataToParent(false);
    }, [ModalCloseDataToParent]);

    const cameraToggle = () => {
        setIsCameraOn(!isCameraOn);
    }

    const micToggle = () => {
        setIsMicOn(!isMicOn);
    }

    useEffect(() => {
        function handleKeyPress(event) {
            if (event.key === 'Escape') {
                setNewMeeting(false);
                closeModal();
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [setNewMeeting, closeModal]);

    const webcamStyle = {
        width: '100%',
        height: '100%',
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevNote => {
            return {
                ...prevNote,
                [name]: value
            };
        });
    }

    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const formSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const fd = formData;
            
            // Validate input
            if (!fd.username || !fd.password) {
                setErrorMsg("Username and password are required!");
                return;
            }
            
            if (status === 'new' && fd.password !== fd.confirmPassword) {
                setErrorMsg("Passwords do not match!");
                return;
            }
            
            setIsLoading(true);
            setErrorMsg("");
            
            // Prepare request body with authenticated user info
            const requestBody = status === 'new' 
                ? {
                    roomName: fd.roomName || `${fd.username}'s Meeting`,
                    username: fd.username,
                    password: fd.password,
                    isInstant: false,
                    userEmail: currentUser?.email, // Add user email
                    userId: currentUser?.uid // Add Firebase UID
                }
                : {
                    roomCode: fd.roomCode,
                    username: fd.username,
                    password: fd.password,
                    userEmail: currentUser?.email,
                    userId: currentUser?.uid
                };
            
            console.log('🚀 Sending authenticated request:', {
                endpoint: status === 'new' ? '/api/room/create' : '/api/room/join',
                body: requestBody
            });
            
            try {
                const backendUrl = API_BASE_URL;
                const apiEndpoint = status === 'new' ? '/api/room/create' : '/api/room/join';
                
                const response = await fetch(`${backendUrl}${apiEndpoint}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(requestBody)
                });

                console.log('📡 Response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Server error:', errorData);
                    throw new Error(errorData.error || errorData.message || 'Room operation failed');
                }

                const data = await response.json();
                console.log('✅ Firebase response:', data);

                if (!data.success) {
                    throw new Error(data.error || 'Operation failed');
                }

                const meetingLink = data.meetingLink || `/room/${data.roomCode}`;

                console.log('🎉 Meeting ready:', {
                    roomCode: data.roomCode,
                    meetingId: data.meetingId,
                    userId: data.userId
                });

                // Clear form
                setFormData({
                    roomName: "",
                    roomCode: "",
                    username: currentUser?.displayName || currentUser?.email?.split('@')[0] || "",
                    password: "",
                    confirmPassword: "",
                    status: status
                });
                
                // Navigate with user data
                navigate("/dashboard", { 
                    state: { 
                        roomCode: data.roomCode,
                        meetingId: data.meetingId,
                        roomName: data.roomName,
                        userId: data.userId,
                        username: data.username,
                        hostName: data.hostName,
                        meetingLink: meetingLink,
                        settings: data.settings,
                        status: status,
                        database: 'firebase',
                        authenticatedUser: {
                            uid: currentUser?.uid,
                            email: currentUser?.email,
                            displayName: currentUser?.displayName
                        }
                    } 
                });
            } catch (error) {
                console.error('❌ Room operation failed:', error);
                
                if (error.message.includes('fetch')) {
                    setErrorMsg('Cannot connect to server. Please ensure:\n1. Server is running\n2. Firebase is configured');
                } else if (error.message.includes('not found')) {
                    setErrorMsg('Room not found. Please check the room code.');
                } else if (error.message.includes('password')) {
                    setErrorMsg('Incorrect password.');
                } else if (error.message.includes('full')) {
                    setErrorMsg('Room is full.');
                } else {
                    setErrorMsg(`Error: ${error.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('❌ Unexpected error:', error);
            setErrorMsg(`Unexpected error: ${error.message}`);
            setIsLoading(false);
        }
    }
    
    let [isOpen, setIsOpen] = useState(true)

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl text-left align-middle shadow-2xl transition-all bg-white">
                                    {/* Header with User Info */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold">
                                                        {status === 'new' ? 'Create New Meeting' : 'Join Meeting'}
                                                    </h2>
                                                    <p className="text-blue-100 text-sm flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                        Logged in as {currentUser?.displayName || currentUser?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                className='hover:bg-white/20 rounded-xl p-2 text-white/80 hover:text-white transition-all duration-200' 
                                                onClick={closeModal}
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-0">
                                        {/* Form Section */}
                                        <div className="p-8">
                                            <form onSubmit={formSubmit} className="space-y-6">
                                                {status === 'new' && (
                                                    <div>
                                                        <label htmlFor="roomname" className="block text-sm font-semibold text-gray-700 mb-3">
                                                            Meeting Name
                                                            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                name="roomName"
                                                                id="roomname"
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                                placeholder="Team Standup, Project Review..."
                                                                value={formData.roomName}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {status === 'join' && (
                                                    <div>
                                                        <label htmlFor="roomcode" className="block text-sm font-semibold text-gray-700 mb-3">
                                                            Meeting Code
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                name="roomCode"
                                                                id="roomcode"
                                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                                placeholder="ABC123DEF4"
                                                                value={formData.roomCode}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                                                        Display Name
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            name="username"
                                                            id="username"
                                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                            placeholder="Enter display name for meeting"
                                                            value={formData.username}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                                                        Meeting Password
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            id="password"
                                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                            placeholder="Create a secure password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {status === 'new' && (
                                                    <div>
                                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                                                            Confirm Password
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </div>
                                                            <input
                                                                type="password"
                                                                name="confirmPassword"
                                                                id="confirmPassword"
                                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                                placeholder="Confirm your password"
                                                                value={formData.confirmPassword}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {errorMsg && (
                                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="whitespace-pre-line">{errorMsg}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <button 
                                                    type="submit"
                                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <svg className="w-6 h-6 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            {status === 'new' ? 'Creating Meeting...' : 'Joining Meeting...'}
                                                        </>
                                                    ) : status === 'new' ? (
                                                        <>
                                                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Create Meeting
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                            </svg>
                                                            Join Meeting
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Video Preview Section */}
                                        <div className="bg-gray-50 p-8 border-l border-gray-200">
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
                                                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
                                                        {isCameraOn ? (
                                                            <Webcam
                                                                audio={false}
                                                                style={webcamStyle}
                                                                ref={webcamRef}
                                                                screenshotFormat="image/jpeg"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                                                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 bg-gradient-to-br from-blue-500 to-purple-600">
                                                                    {formData.username ? formData.username.charAt(0).toUpperCase() : currentUser?.displayName?.charAt(0).toUpperCase() || '?'}
                                                                </div>
                                                                <h4 className="text-gray-300 font-medium text-lg">Camera is off</h4>
                                                                <p className="text-gray-500 text-sm mt-2">Click the camera icon below to turn it on</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Media Controls */}
                                                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Media Settings</h4>
                                                    <div className="flex justify-center gap-6">
                                                        <button 
                                                            onClick={micToggle}
                                                            className={`p-4 rounded-full transition-all duration-200 ${
                                                                isMicOn 
                                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                            }`}
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {isMicOn ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                                )}
                                                            </svg>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={cameraToggle}
                                                            className={`p-4 rounded-full transition-all duration-200 ${
                                                                isCameraOn 
                                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                            }`}
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {isCameraOn ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                ) : (
                                                                    <>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
                                                                    </>
                                                                )}
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-center gap-8 mt-4 text-xs text-gray-500">
                                                        <span className={`flex items-center gap-1 ${isMicOn ? 'text-green-600' : 'text-red-600'}`}>
                                                            <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                            {isMicOn ? 'Mic On' : 'Mic Off'}
                                                        </span>
                                                        <span className={`flex items-center gap-1 ${isCameraOn ? 'text-green-600' : 'text-red-600'}`}>
                                                            <div className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                            {isCameraOn ? 'Camera On' : 'Camera Off'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

NewRoom.propTypes = {
    status: PropTypes.oneOf(['new', 'join']).isRequired,
    onModalClose: PropTypes.func.isRequired
};