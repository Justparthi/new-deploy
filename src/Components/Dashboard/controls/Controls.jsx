import './Controls.css'
import { useContext } from 'react';
import { DashboardStateContext } from '../../../Utils/DashboardStateProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomSettings from '../Settings/RoomSettings';
import { API_ENDPOINTS } from '../../../Utils/apiConfig';

const Controls = ({ onToggleTranscript, showTranscript }) => {

    const navigate = useNavigate()
    const location = useLocation()
    const { isMicActive, setMicActive } = useContext(DashboardStateContext);
    const { isCameraActive, setCameraActive } = useContext(DashboardStateContext);
    const { isScreenShareActive, setScreenShareActive } = useContext(DashboardStateContext);
    const { isChatBoxActive, setChatBoxActive } = useContext(DashboardStateContext);
    const { isParticipantsActive, setParticipantsActive } = useContext(DashboardStateContext);
    const { isSettingsActive, setSettingsActive } = useContext(DashboardStateContext);
    const { isInviteParticipant, setInviteParticipant } = useContext(DashboardStateContext)
    const { roomId } = useContext(DashboardStateContext);


    const closeMeetingRoom = async () => {
        if (confirm('Are you sure you want to leave this room?')) {
            // Get user data from location state
            const locationState = location.state;
            const currentRoomId = roomId || locationState?.roomId;
            const currentUserId = locationState?.userId;
            
            if (currentRoomId && currentUserId) {
                try {
                    // Notify server that user is leaving
                    await fetch(API_ENDPOINTS.ROOM_LEAVE, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            roomId: currentRoomId,
                            userId: currentUserId
                        })
                    });
                    console.log('✅ Successfully left room');
                } catch (error) {
                    console.error('Failed to notify server of room leave:', error);
                }
            }
            
            navigate('/')
        }
    }


    return (
        <div className="meeting-controls">
            {/* Microphone */}
            <button 
                className={`control-button ${isMicActive ? '' : 'danger'}`}
                onClick={() => setMicActive(!isMicActive)}
                title={isMicActive ? "Mute" : "Unmute"}
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {!isMicActive ? (
                        <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
                        </>
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                </svg>
            </button>

            {/* Camera */}
            <button 
                className={`control-button ${isCameraActive ? '' : 'danger'}`}
                onClick={() => setCameraActive(!isCameraActive)}
                title={isCameraActive ? "Turn off camera" : "Turn on camera"}
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {!isCameraActive ? (
                        <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
                        </>
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                </svg>
            </button>

            {/* Screen Share */}
            <button 
                className={`control-button ${isScreenShareActive ? 'active' : ''}`}
                onClick={() => setScreenShareActive(!isScreenShareActive)}
                title="Share screen"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </button>

            {/* Live Transcript Toggle - NEW BUTTON */}
            <button 
                className={`control-button ${showTranscript ? 'active' : ''}`}
                onClick={onToggleTranscript}
                title={showTranscript ? "Hide Live Transcript" : "Show Live Transcript"}
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </button>

            {/* Chat */}
            <button 
                className={`control-button ${isChatBoxActive ? 'active' : ''}`}
                onClick={() => { setChatBoxActive(!isChatBoxActive); setParticipantsActive(false) }}
                title="Chat"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>

            {/* Participants */}
            <button 
                className={`control-button ${isParticipantsActive ? 'active' : ''}`}
                onClick={() => { setParticipantsActive(!isParticipantsActive); setChatBoxActive(false); setInviteParticipant(false); }}
                title="Participants"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>

            <RoomSettings />

            {/* End Call */}
            <button 
                className="control-button danger"
                onClick={closeMeetingRoom}
                title="Leave meeting"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
            </button>
        </div>
    )
}
export default Controls;