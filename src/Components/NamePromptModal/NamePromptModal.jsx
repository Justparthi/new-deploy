import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function NamePromptModal({ isOpen, onSubmit, roomId }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (name.trim().length === 0) {
      setError('Please enter your name');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    onSubmit(name.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-8 text-left align-middle shadow-2xl transition-all glass-effect border border-white/20" style={{background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)'}}>
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-white mb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="gradient-text" style={{background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Join Meeting</span>
                  </div>
                </Dialog.Title>

                <p className="text-gray-400 text-sm mt-3 mb-6">
                  Enter your name to join the meeting
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-200 mb-2">
                      Your Name
                    </label>
                    <div className="flex rounded-xl shadow-sm glass-effect border border-white/20 focus-within:border-purple-500 transition-all">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoFocus
                        className="block outline-0 flex-1 border-0 bg-transparent py-3 px-4 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError('');
                        }}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                    {error && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="w-full shadow-lg mt-6 text-white outline-0 py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 font-semibold"
                    style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                    onClick={handleSubmit}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Join Meeting
                  </button>

                  {roomId && (
                    <p className="text-gray-500 text-xs text-center mt-4">
                      Room: {roomId}
                    </p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
