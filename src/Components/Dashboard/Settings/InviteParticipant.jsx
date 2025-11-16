import React, { useState, useContext } from 'react'
import { DashboardStateContext } from '../../../Utils/DashboardStateProvider';

export default function InviteParticipant({ onAddParticipant }) {
  const { roomId } = useContext(DashboardStateContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const getMeetingLink = () => {
    if (roomId) {
      return `${window.location.origin}/room/${roomId}`;
    }
    return window.location.href;
  };

  const copyMeetingLink = () => {
    const link = getMeetingLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage('Please enter a name');
      return;
    }

    if (onAddParticipant) {
      onAddParticipant({ name: name.trim(), email: email.trim() });
      setMessage('Participant added successfully!');
      setName('');
      setEmail('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="h-screen flex flex-col p-3">
      <h3 className='py-3 text-white text-md'>Invite Participant</h3>
      
      {/* Meeting Link Section */}
      <div className="mb-4 p-3 bg-slate-800 rounded-md">
        <p className="text-xs text-gray-400 mb-2">Meeting Link:</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={getMeetingLink()}
            readOnly
            className="flex-1 text-xs bg-slate-700 text-white px-2 py-1 rounded border-0 outline-none"
          />
          <button
            type="button"
            onClick={copyMeetingLink}
            className="px-3 py-1 text-xs text-white rounded transition-all duration-300 hover:scale-105"
            style={{background: 'linear-gradient(135deg, #39603D 0%, #9DC88D 100%)'}}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Share this link with others to join the meeting</p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block text-sm w-full outline-0 rounded-md border-0 py-1.5 pl-3 mb-3 text-gray-900 ring-1 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Name (required)"
          />
          
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block text-sm w-full outline-0 rounded-md border-0 py-1.5 pl-3 text-gray-900 ring-1 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Email (optional)"
          />

          <button 
            type="submit"
            className='px-3 py-2 mt-3 text-sm text-white rounded w-full transition-all duration-300 hover:scale-105'
            style={{background: 'linear-gradient(135deg, #39603D 0%, #9DC88D 100%)'}}
          >
            Add Participant
          </button>
          
          {message && (
            <p className={`mt-3 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
