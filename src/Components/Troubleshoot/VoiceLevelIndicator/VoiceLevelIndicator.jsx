import React, { useEffect, useState, useContext } from 'react';
import { StateContext } from '../../../Utils/StateProvider';


const VoiceLevelIndicator = () => {
    const [audioContext, setAudioContext] = useState(null);
    const [analyser, setAnalyser] = useState(null);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const { isTroublshootActive, setTroubleshoot } = useContext(StateContext);
    
    const stopAudioAccess = () => {
        if (window.audioContext) {
            window.audioContext.close()
                .then(() => {
                    console.log('AudioContext closed successfully');
                    window.audioContext = null; // Set it to null to release the reference
                })
                .catch(error => {
                    console.error('Error while closing AudioContext:', error);
                });
        }
    };

    useEffect(() => {
        const initAudioContext = async () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
    
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
    
    
                    const updateVoiceLevel = () => {
                        analyser.getByteTimeDomainData(dataArray);
                        let sum = 0;
                        dataArray.forEach((value) => (sum += value));
                        const average = sum / bufferLength;
                        const voiceLevel = (average / 128) * 100; // Adjust for your desired range
                        setVoiceLevel(voiceLevel);
                        requestAnimationFrame(updateVoiceLevel);
                    };
    
                    updateVoiceLevel();
                } catch (error) {
                    console.error('Error accessing microphone:', error);
                }
                setAudioContext(audioContext);
                setAnalyser(analyser);
            } catch (error) {
                alert(`Error initializing AudioContext: ${error}`);
            }
        };
        if (isTroublshootActive) {
            initAudioContext();
            console.log(navigator.mediaDevices);
        } else {
            stopAudioAccess(); // Call the stopAudioAccess function to stop audio access
        }
    }, []);


    return (
        <div>
            <div style={{ width: '90%', height: '2px' }}>
                <div
                    style={{
                        background: '#9DC88D',
                        width: `${voiceLevel}%`,
                        height: '100%',
                        transition: 'width 0.05s',
                    }}
                ></div>
            </div>
        </div>
    );
};

export default VoiceLevelIndicator;
