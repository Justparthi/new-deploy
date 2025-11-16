import PropTypes from "prop-types";
import './Messages.css'

export default function Messages({ name, message, isBot = false }) {
  return (
    <div 
      className={`px-4 py-3 rounded-xl text-left mt-3 text-normal glass-effect border transition-all duration-300 hover:scale-[1.02] ${
        isBot 
          ? '' 
          : 'border-white/10 bg-white/5'
      }`}
      style={isBot ? {borderColor: 'rgba(157, 200, 141, 0.3)', background: 'linear-gradient(to right, rgba(57, 96, 61, 0.2), rgba(157, 200, 141, 0.2))'} : {}}
    >
      <div className="flex items-center gap-2 mb-1">
        {isBot && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #39603D 0%, #9DC88D 100%)'}}>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <p className={`text-xs font-semibold ${isBot ? 'text-gray-400' : 'text-gray-400'}`} style={isBot ? {color: '#9DC88D'} : {}}>
          {name}
        </p>
      </div>
      <p className='text-gray-200 mt-1 text-sm whitespace-pre-line leading-relaxed'>{message}</p>
    </div>
  )
}

Messages.propTypes = {
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  isBot: PropTypes.bool
};
