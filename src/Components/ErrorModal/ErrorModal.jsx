import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const ErrorModal = ({ isOpen, onClose, error }) => {
  const getErrorDetails = () => {
    if (!error) return { title: 'Error', message: 'An unknown error occurred', icon: '❌', solutions: [] };

    if (error.name === 'NotAllowedError') {
      return {
        title: 'Permission Denied',
        message: 'Camera/Microphone access was denied.',
        icon: '🚫',
        solutions: [
          'Click the lock icon in your browser address bar',
          'Change camera and microphone permissions to "Allow"',
          'Refresh the page and try again'
        ]
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        title: 'No Devices Found',
        message: 'No camera or microphone was detected.',
        icon: '📹',
        solutions: [
          'Connect a camera and/or microphone to your computer',
          'Check if your devices are properly connected',
          'Refresh the page after connecting devices'
        ]
      };
    }

    if (error.name === 'DeviceInUseError' || error.name === 'NotReadableError') {
      return {
        title: 'Device Already in Use',
        message: 'Your camera or microphone is being used by another application.',
        icon: '⚠️',
        solutions: [
          'Close other video conferencing apps (Zoom, Teams, Skype, etc.)',
          'Close other browser tabs using your camera/microphone',
          'Close any camera or recording applications',
          'Restart your browser if the issue persists',
          'Restart your computer as a last resort'
        ]
      };
    }

    return {
      title: 'Connection Error',
      message: error.message || 'Failed to initialize the meeting.',
      icon: '❌',
      solutions: [
        'Check your internet connection',
        'Refresh the page and try again',
        'Contact support if the problem persists'
      ]
    };
  };

  const errorDetails = getErrorDetails();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all glass-effect border border-red-500/30" style={{background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(62, 22, 22, 0.98) 100%)'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                    {errorDetails.icon}
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-white"
                  >
                    {errorDetails.title}
                  </Dialog.Title>
                </div>

                <div className="mt-4">
                  <p className="text-gray-300 mb-4">
                    {errorDetails.message}
                  </p>

                  {errorDetails.solutions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-200 mb-2">How to fix this:</h4>
                      <ul className="space-y-2">
                        {errorDetails.solutions.map((solution, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                    style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ErrorModal;
