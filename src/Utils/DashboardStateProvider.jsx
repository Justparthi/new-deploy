import { createContext, useState, useEffect } from "react";
export const DashboardStateContext = createContext();
export default function DashboardStateProvider({ children }) {

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isMicActive, setMicActive] = useState(true);
    const [isCameraActive, setCameraActive] = useState(true);
    const [isScreenShareActive, setScreenShareActive] = useState(false);
    const [isChatBoxActive, setChatBoxActive] = useState(false);
    const [isParticipantsActive, setParticipantsActive] = useState(false);
    const [isSettingsActive, setSettingsActive] = useState(false);

    const [isInviteParticipant, setInviteParticipant] = useState(false);
    
    // Real-time meeting state
    const [roomId, setRoomId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [participantMediaStates, setParticipantMediaStates] = useState(new Map()); // userId -> {cameraOn, micOn}
    const [connectionStatuses, setConnectionStatuses] = useState(new Map()); // userId -> {connected, quality, reconnectAttempts}
    
    const [participantsList, setParticipantsList] = useState([]);

    const addParticipant = (newParticipant) => {
        setParticipantsList([...participantsList, {
            name: newParticipant.name,
            message: newParticipant.email || "This is a Message",
            host: false
        }]);
    };

    const removeParticipant = (index) => {
        setParticipantsList(participantsList.filter((_, i) => i !== index));
    };
    return (
        <DashboardStateContext.Provider value={{
            isInviteParticipant,
            setInviteParticipant,
            
            isFullScreen,
            setIsFullScreen,
            
            isMicActive,
            setMicActive,
            
            isCameraActive,
            setCameraActive,
            
            isScreenShareActive,
            setScreenShareActive,
            
            isChatBoxActive,
            setChatBoxActive,
            
            isParticipantsActive,
            setParticipantsActive,
            
            isSettingsActive,
            setSettingsActive,
            
            participantsList,
            setParticipantsList,
            addParticipant,
            removeParticipant,
            
            roomId,
            setRoomId,
            userId,
            setUserId,
            userName,
            setUserName,
            localStream,
            setLocalStream,
            remoteStreams,
            setRemoteStreams,
            participantMediaStates,
            setParticipantMediaStates,
            connectionStatuses,
            setConnectionStatuses
        }}>
            {children}
        </DashboardStateContext.Provider>
    )
}