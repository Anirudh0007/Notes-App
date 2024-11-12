import React from 'react';
import {FaSearch} from 'react-icons/fa';
import {IoMdClose} from 'react-icons/io';

const SearchBar = ({userInfo,value,onChange,handleSearch, onClearSearch}) => {

  if (!userInfo) {
    return null; // Don't render anything if userInfo is not present
  }
  return (
    <div className='flex w-80 items-center px-4 bg-slate-100 rounded-md'>
      <input
      type='text'
      value={value}
      placeholder='Search something'
      onChange={onChange}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      className='w-full text-xs bg-transparent py-[11px] outline-none'
      />
      {value && (<IoMdClose onClick={onClearSearch} className='text-xl text-slate-400 cursor-pointer hover:text-black mr-3'/>)}
      <FaSearch onClick={handleSearch} className='text-slate-400 cursor-pointer hover:text-black '/>
      
    </div>
  )
}

export default SearchBar
