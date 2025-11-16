
import React, { useContext, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam';
const CameraTroubleshoot = () => {
    const [isCameraOn, setIsCameraOn] = useState(true);
    const webcamRef = useRef(null);
    const webcamStyle = {
        width: 'max-content',   // Set the width to 50% of the parent container
        height: 'max-content',  // Set the height to 50% of the parent container
    };
    const cameraToggle = () => {
        setIsCameraOn(!isCameraOn);
    }

    return (
        <div>
            {isCameraOn ?
                <div className="">
                    <Webcam
                        audio={false}
                        style={webcamStyle}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                    />

                </div> : <h3 className='text-red-500 bg-red-50 px-4 py-24 text-center border'>Please Switch on the camera</h3>
            }
            <div className="px-16 py-4 bg-slate-700 flex justify-center items-center">

                {/* video */}
                <svg width="25" onClick={cameraToggle} height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_13_118)">
                        <path d="M23.5 7L16.5 12L23.5 17V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.5 5H3.5C2.39543 5 1.5 5.89543 1.5 7V17C1.5 18.1046 2.39543 19 3.5 19H14.5C15.6046 19 16.5 18.1046 16.5 17V7C16.5 5.89543 15.6046 5 14.5 5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                        <clipPath id="clip0_13_118">
                            <rect width="24" height="24" fill="white" transform="translate(0.5)" />
                        </clipPath>
                    </defs>
                </svg>



            </div>
        </div>
    )
}

export default CameraTroubleshoot;