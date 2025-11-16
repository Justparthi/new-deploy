import { useContext } from 'react';
import './Navbar.css'
import { StateContext } from '../../Utils/StateProvider';
import { useState } from 'react';
export default function Navbar() {
    const current = new Date();
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const date = `${current.getHours() % 12 === 0 ? 12 : current.getHours() % 12}:${current.getMinutes()} ${current.getHours() >= 12 ? "PM" : "AM"} - ${month[current.getMonth()]}  ${current.getDate()}  ${current.getFullYear()}`;
    // console.log(date);

    const { isTroublshootActive, setTroubleshoot } = useContext(StateContext);
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

     
      function openModal() {
        setTroubleshoot(true)
      }
    return (
        <nav className="px-6 lg:px-16 py-6 bg-white border-b border-gray-200 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="brand text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MeetSphere</span>
                </div>

                {/* Desktop Menu */}
                <div className={`lg:flex ${isOpen ? 'block' : 'hidden'}`}>
                    <ul className={`lg:flex items-center space-x-6 ${isOpen ? 'flex-col gap-y-4 text-center mt-4' : ''}`}>
                        <li>
                            <a
                                href="/"
                                className="text-gray-600 hover:text-blue-600 leading-7 transition duration-300 ease-in-out font-medium"
                            >
                                About us
                            </a>
                        </li>
                        <li>
                            <a
                                href="/transcripts"
                                className="text-gray-600 hover:text-blue-600 leading-7 transition duration-300 ease-in-out font-medium"
                            >
                                Transcripts
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="p-2 rounded-lg hover:bg-blue-50 transition duration-300 ease-in-out inline-flex items-center justify-center"
                                title="Help"
                            >
                                <svg className="w-6 h-6 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </a>
                        </li>

                        <li onClick={openModal}>
                            <button
                                className="p-2 rounded-lg hover:bg-blue-50 transition duration-300 ease-in-out inline-flex items-center justify-center"
                                title="Settings"
                            >
                                <svg className="w-6 h-6 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <button
                        onClick={toggleNavbar}
                        className="text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-blue-50 transition"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
