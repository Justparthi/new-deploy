import { useContext } from 'react';
import { DashboardStateContext } from '../../../Utils/DashboardStateProvider';
import Participant from './Participant';
import InviteParticipant from '../Settings/InviteParticipant';

export default function Participants() {

    const { isInviteParticipant, setInviteParticipant, participantsList, removeParticipant, addParticipant } = useContext(DashboardStateContext);
    
    // If invite panel is open, show it instead
    if (isInviteParticipant) {
        return <InviteParticipant onAddParticipant={addParticipant} />;
    }
    
    return (
        <div className="h-screen flex flex-col bg-white">
            <h3 className='p-4 text-gray-800 text-lg font-semibold border-b border-gray-200'>Participants</h3>
            <button className="px-4 py-3 mx-3 my-3 flex justify-center items-center text-white rounded-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" onClick={() => setInviteParticipant(true)}>
                <svg width="20" height="20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="user-plus" clipPath="url(#clip0_121_19)">
                        <path id="Vector" d="M17 21.8103V19.8103C17 18.7494 16.5786 17.732 15.8284 16.9819C15.0783 16.2317 14.0609 15.8103 13 15.8103H6C4.93913 15.8103 3.92172 16.2317 3.17157 16.9819C2.42143 17.732 2 18.7494 2 19.8103V21.8103" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path id="Vector_2" d="M9.5 11.8103C11.7091 11.8103 13.5 10.0194 13.5 7.8103C13.5 5.60116 11.7091 3.8103 9.5 3.8103C7.29086 3.8103 5.5 5.60116 5.5 7.8103C5.5 10.0194 7.29086 11.8103 9.5 11.8103Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path id="Vector_3" d="M21 8.8103V14.8103" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path id="Vector_4" d="M24 11.8103H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                        <clipPath id="clip0_121_19">
                            <rect width="24" height="24" fill="white" transform="translate(0 0.810303)" />
                        </clipPath>
                    </defs>
                </svg>

                <span className='ms-2 text-sm'>
                    Invite Others
                </span>
            </button>
            <div className="flex-1 p-2 overflow-auto custom-scrollbar">
                {/* The use of 'flex-1' will make this div take up all available vertical space within the parent */}
                {participantsList.map((chat, index) =>
                    <Participant
                        name={chat.name}
                        host={chat.host || false}
                        index={index}
                        onRemove={removeParticipant}
                        key={index}
                    />
                )}
            </div>

        </div>
    )
}