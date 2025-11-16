import React from 'react'
import ParticipantsControls from './ParticipantsControls'
export default function Participant({ name, host, index, onRemove }) {
  return (
    <div className="p-2 border border-slate-500 hover:bg-gray-800 flex justify-between items-center rounded-md text-left mb-3" >
      <div className="flex items-center">
        <div className='me-1'>
          <svg width="24" height="24" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="bxs-pin.svg">
              <path id="Vector" d="M15.5129 12.1702V6.58423H17.5129V4.58423C17.5129 4.0538 17.3022 3.54509 16.9271 3.17001C16.552 2.79494 16.0433 2.58423 15.5129 2.58423H9.51288C8.98245 2.58423 8.47374 2.79494 8.09867 3.17001C7.72359 3.54509 7.51288 4.0538 7.51288 4.58423V6.58423H9.51288V12.1702L6.80588 13.8772C6.71284 13.9699 6.63905 14.0801 6.58876 14.2015C6.53848 14.3228 6.51269 14.4529 6.51288 14.5842V16.5842C6.51288 16.8494 6.61824 17.1038 6.80577 17.2913C6.99331 17.4789 7.24766 17.5842 7.51288 17.5842H11.5129V20.5842L12.5129 22.5842L13.5129 20.5842V17.5842H17.5129C17.7781 17.5842 18.0325 17.4789 18.22 17.2913C18.4075 17.1038 18.5129 16.8494 18.5129 16.5842V14.5842C18.5131 14.4529 18.4873 14.3228 18.437 14.2015C18.3867 14.0801 18.3129 13.9699 18.2199 13.8772L15.5129 12.1702Z" fill="white" />
            </g>
          </svg>
        </div>
        <img src="images/user-black.svg" alt="" className='bg-slate-100 p-1 rounded-2xl' />
        <div className='ms-2'>
          <p className='text-xs text-slate-300 '>{name}</p>
          {host &&
            <p className='text-xs text-slate-500 mt-1/2'>Host</p>}
        </div>
      </div>
      <ParticipantsControls onRemove={() => onRemove(index)} host={host} />
    </div>
  )
}
