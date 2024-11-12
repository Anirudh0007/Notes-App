import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';


const PasswordInput = ({value, onChange, placeholder}) => {

  const [isShowPassword, setIsShowPassword]=useState(false);

  const toggleShowPassword=() =>{
    setIsShowPassword(!isShowPassword)
  }

  return (
    <div className="relative flex items-center">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Password'}
        type={isShowPassword ? 'text' : 'password'}
        className="input-box pr-10"
      />
      <span
        className="absolute right-3 cursor-pointer text-primary"
        onClick={toggleShowPassword}
      >
        {isShowPassword ? <FaRegEyeSlash size={22} /> : <FaRegEye size={22} />}
      </span>
    </div>
  );
};

export default PasswordInput
