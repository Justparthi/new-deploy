import { Popover, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { useContext } from 'react'
import { useRef } from 'react'
import { DashboardStateContext } from '../../../Utils/DashboardStateProvider'
import { useNavigate } from 'react-router-dom';
const solutions = [
  {
    name: 'Insights',
    description: 'Measure actions your users take',
    href: '##',
    icon: IconOne,
  },
  {
    name: 'Automations',
    description: 'Create your own targeted content',
    href: '##',
    icon: IconTwo,
  },
  {
    name: 'Reports',
    description: 'Keep track of your growth',
    href: '##',
    icon: IconThree,
  },
]


export default function RoomSettings() {
  const navigate = useNavigate();
  const { isSettingsActive, setSettingsActive } = useContext(DashboardStateContext);
  const { isFullScreen, setIsFullScreen } = useContext(DashboardStateContext);
  const { isInviteParticipant, setInviteParticipant } = useContext(DashboardStateContext)
  const { isParticipantsActive, setParticipantsActive } = useContext(DashboardStateContext);
  const { roomId, userId } = useContext(DashboardStateContext);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Recording disabled to prevent errors
  const status = 'idle';
  const startRecording = () => console.log('Recording disabled');
  const stopRecording = () => console.log('Recording disabled');
  const mediaBlobUrl = null;

  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  //make full screen feature function once click on the go full screen button event 
  const handleFullScreenToggle = () => {
    const element = document.documentElement;

    if (!isFullScreen) {
      // Request full screen
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      // Exit full screen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    // Toggle the state
    setIsFullScreen(!isFullScreen);
  };

  // Function to handle key press events (Escape key)
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isSettingsActive) {
      setSettingsActive(false);
    }
  };

  // Function to handle tab press events (when focus moves away from the panel)
  const handleTabPress = (event) => {
    if (panelRef.current && !panelRef.current.contains(event.target)) {
      setSettingsActive(false);
    }
  };

  useEffect(() => {
    // Add event listeners when the component mounts
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleTabPress);

    // Remove event listeners when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleTabPress);
    };
  }, []);

  return (

    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            ref={buttonRef}
            className={`control-button ${isSettingsActive ? 'active' : ''}`}
            role="button" 
            onClick={() => setSettingsActive(!isSettingsActive)}
            title="Settings"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Popover.Button>
          {isSettingsActive && (<div>
            <Transition
              as={Fragment}
              show={open && isSettingsActive}
              enter="transition ease-out"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel ref={panelRef} className="absolute bottom-14 text-sm w-64 z-50 sm:px-0 opacity-100" static>
                <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-xl" style={{background: 'rgba(30, 58, 138, 0.95)'}}>
                  <div className="relative text-white pb-1">

                    {/* User Header */}
                    <div className="flex items-center border-b border-white/10 px-4 py-3" style={{background: 'linear-gradient(to right, rgba(57, 96, 61, 0.2), rgba(157, 200, 141, 0.2)'}}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{background: 'linear-gradient(135deg, #39603D 0%, #9DC88D 100%)'}}>
                        {userId ? userId.slice(-1).toUpperCase() : 'K'}
                      </div>
                      <div className="ms-3">
                        <p className="font-semibold">User {userId ? userId.slice(-4) : '****'}</p>
                        <p className="text-xs text-gray-400">Host</p>
                      </div>
                    </div>


                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={() => { if (isInviteParticipant == false) setInviteParticipant(!isInviteParticipant); setParticipantsActive(false); setSettingsActive(false); }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      <p className='ms-3 font-medium'>Invite People</p>
                    </div>

                    {status === 'recording' ? <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={stopRecording}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="img-height">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                      </svg>

                      <p className='ms-3'>Stop Recording</p>
                    </div> : <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={startRecording}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="img-height">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                      </svg>

                      <p className='ms-3'>Start Recording</p>
                    </div>}
                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={() => {
                      alert('Troubleshooting Tips:\n\n1. Check camera/mic permissions\n2. Refresh the page\n3. Try a different browser\n4. Check if other apps are using camera/mic');
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                      </svg>
                      <p className='ms-3 font-medium'>Troubleshoot Media</p>
                    </div>
                    
                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={handleFullScreenToggle}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                      <p className='ms-3 font-medium'>{!isFullScreen ? 'Go fullscreen' : 'Exit fullscreen'}</p>
                    </div>

                    <div className="border-b border-white/10 my-2"></div>

                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={() => {
                      const meetingLink = `${window.location.origin}/room/${roomId}`;
                      alert(`Room Information:\n\nRoom ID: ${roomId}\nYour User ID: ${userId}\n\nMeeting Link:\n${meetingLink}\n\nShare this link to invite participants!`);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <p className='ms-3 font-medium'>Room Info</p>
                    </div>


                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={() => {
                      const newPassword = prompt('Enter new room password (leave empty for no password):');
                      if (newPassword !== null) {
                        alert(newPassword ? `Room password set to: ${newPassword}` : 'Room password removed');
                      }
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      <p className='ms-3 font-medium'>Change password</p>
                    </div>


                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={() => {
                      alert('Moderation Controls:\n\n✓ Mute all participants\n✓ Disable participant video\n✓ Lock meeting room\n✓ Remove participants\n✓ Enable waiting room\n\n(Feature coming soon!)');
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                      </svg>
                      <p className='ms-3 font-medium'>Moderation Control</p>
                    </div>

                    <div className="border-b border-white/10 my-2"></div>

                    <div className="flex items-center my-1 px-4 py-3 hover:bg-white/10 rounded-lg mx-2 cursor-pointer transition-all duration-200" role='button' onClick={() => {
                      alert('MeetSphere Help:\n\n📹 Camera: Click camera icon to toggle\n🎤 Microphone: Click mic icon to mute/unmute\n🖥️ Screen Share: Click monitor icon\n💬 Chat: Click chat icon for messaging\n👥 Participants: View all participants\n⚙️ Settings: Access this menu\n\nKeyboard Shortcuts:\nCtrl+D: Mute/Unmute\nCtrl+E: Camera On/Off\n\nNeed more help? Visit meetsphere.com/support');
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>

                      <p className='ms-3 font-medium'>Help</p>
                    </div>

                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </div>)}
        </>
      )}
    </Popover>

  )
}

function IconOne() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="#FFEDD5" />
      <path
        d="M24 11L35.2583 17.5V30.5L24 37L12.7417 30.5V17.5L24 11Z"
        stroke="#FB923C"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.7417 19.8094V28.1906L24 32.3812L31.2584 28.1906V19.8094L24 15.6188L16.7417 19.8094Z"
        stroke="#FDBA74"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.7417 22.1196V25.882L24 27.7632L27.2584 25.882V22.1196L24 20.2384L20.7417 22.1196Z"
        stroke="#FDBA74"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconTwo() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="#FFEDD5" />
      <path
        d="M28.0413 20L23.9998 13L19.9585 20M32.0828 27.0001L36.1242 34H28.0415M19.9585 34H11.8755L15.9171 27"
        stroke="#FB923C"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.804 30H29.1963L24.0001 21L18.804 30Z"
        stroke="#FDBA74"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconThree() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="#FFEDD5" />
      <rect x="13" y="32" width="2" height="4" fill="#FDBA74" />
      <rect x="17" y="28" width="2" height="8" fill="#FDBA74" />
      <rect x="21" y="24" width="2" height="12" fill="#FDBA74" />
      <rect x="25" y="20" width="2" height="16" fill="#FDBA74" />
      <rect x="29" y="16" width="2" height="20" fill="#FB923C" />
      <rect x="33" y="12" width="2" height="24" fill="#FB923C" />
    </svg>
  )
}
