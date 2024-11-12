import React from 'react';
import { getInitials } from '../../utils/helper';

const ProfileInfo = ({ userInfo, onLogout }) => {
  if (!userInfo) {
    return null; // Don't render anything if userInfo is not present
  }
  
  console.log("ProfileInfo userInfo:", userInfo); // Debug userInfo

  return (
    <div className='flex items-center gap-3'>
      <div className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
        {getInitials(userInfo ?.fullName)}
      </div>
      <div className='flex text-sm font-medium gap-3'>
        <p className='text-sm font-medium'>{userInfo?.fullName}</p>
        <button className='text-sm text-slate-700 underline' onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileInfo;
