import { useContext, useState, useEffect, useRef } from 'react'
import { StateContext } from '../../Utils/StateProvider';
import Webcam from 'react-webcam';
import { Tab } from '@headlessui/react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import './Troubleshoot.css'
import './AudioTroubleshoot/AudioTroubleshoot'
import AudioTroubleshoot from './AudioTroubleshoot/AudioTroubleshoot';
import VideoTroubleshoot from './VideoTroubleshoot/VideoTroubleshoot';


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Troubleshoot() {
    let [categories] = useState({ Audio: [], Video: [] });
    const { isTroublshootActive, setTroubleshoot } = useContext(StateContext);
    const closeModal = () => {
        setTroubleshoot(false);
    }
    

    return (

        <Transition appear show={isTroublshootActive} as={Fragment}>
            <Dialog as="div" className="relative z-10 max0" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                >
                                    <div className="flex justify-between ">
                                        <span>Troubleshoot Media</span>
                                        <button className='hover:bg-gray-100 rounded px-2 text-gray-400' onClick={closeModal} >X ESC</button>
                                    </div>
                                </Dialog.Title>
                                <div className="w-full max-w-md px-2 py-4 sm:px-0">
                                    <Tab.Group>
                                        <Tab.List className="flex space-x-1 rounded-xl p-1" style={{background: 'rgba(57, 96, 61, 0.2)'}}>
                                            {Object.keys(categories).map((category) => (
                                                <Tab
                                                    key={category}
                                                    className={({ selected }) =>
                                                        classNames(
                                                            'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                                                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                                            selected
                                                                ? 'bg-white shadow'
                                                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-900'
                                                        )
                                                    }
                                                >
                                                    {category}
                                                </Tab>
                                            ))}
                                        </Tab.List>
                                        <Tab.Panels className="mt-2">
                                            {Object.keys(categories).map((category) => (
                                                <Tab.Panel
                                                    key={category}
                                                    className={classNames(
                                                        'rounded-xl bg-white',
                                                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none '
                                                    )}
                                                >
                                                    {category === 'Video' && (
                                                        <div className="">
                                                            {isTroublshootActive && <VideoTroubleshoot />}
                                                        </div>
                                                    )}
                                                    {category === 'Audio' && (
                                                        <div className="">
                                                            {isTroublshootActive && <AudioTroubleshoot />}
                                                        </div>
                                                    )}
                                                </Tab.Panel>
                                            ))}
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>)
}