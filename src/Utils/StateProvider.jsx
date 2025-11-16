import  { createContext, useState } from 'react'
export const StateContext = createContext();
export default function StateProvider({children}) {
    
    const [isTroublshootActive,setTroubleshoot] = useState(false);
    const [newMeeting,setNewMeeting] = useState(false);
    const [pinned,setPinned] = useState("Prathamesh");
    const [isMediaAccessActive,setMediaAccessActive] = useState(false);


    return (
        <StateContext.Provider value={{
            isMediaAccessActive,
            setMediaAccessActive,
            isTroublshootActive,
            setTroubleshoot,
            newMeeting,
            setNewMeeting
        }}>
            {children}
        </StateContext.Provider>
    )
}
