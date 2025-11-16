import CameraTroubleshoot from '../CameraTroubleshoot/CameraTroubleshoot';
import { useContext, useState, useEffect, useRef } from 'react'
import { StateContext } from '../../../Utils/StateProvider';

export default function VideoTroubleshoot() {
    const { isTroublshootActive, setTroubleshoot } = useContext(StateContext);

    return (
        <>
            {isTroublshootActive && <CameraTroubleshoot />}
        </>
    )
}