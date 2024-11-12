import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { validateEmail } from '../../utils/helper';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/Input/PasswordInput';
import axiosInstance from '../../utils/axiosInstance';


const SignUp = () => {

  const[name,setName]=useState('');
  const[email, setEmail]=useState('');
  const[password,setPassword]=useState('');
  const [error, setError]=useState('');
  const navigate=useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    // Add sign-up logic here
    if(!name)
      {
        setError('Please enter valid name');
        return('');
      }
    if(!validateEmail(email))
    {
      setError('Please enter valid email');
      return;
    }
    if(!password)
    {
      setError('Please Enter valid password');
      return;
    }
    
    setError('');
    try {
      const response = await axiosInstance.post('/create-account', {
        fullName:name,
          email: email,
          password: password
      });
      
      console.log("Response:", response);

      if (response.data && response.data.error) {
          setError(response.data.message);
          return
      }
      if (response.data && response.data.accessToken) {
      localStorage.setItem('token',response.data.accessToken)
      navigate('/dashboard');
      
      }
  } catch (error) {
      console.error("Full Error:", error);
      if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
      } else if (error.message) {
          setError(error.message);
      } else {
          setError('An unexpected error occurred. Please try again');
      }}
  };

  return (
    <>
      <Navbar />

      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">Sign Up</h4>
            <input type="text" placeholder="Username" className="input-box mb-4" value={name} onChange={(e)=>setName(e.target.value)}/>
            <input type="email" placeholder="Email" className="input-box mb-4" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <PasswordInput value={password} onChange={(e)=>setPassword(e.target.value)}/>
            <p className='text-red-500 text-xs pb-1'>{error}</p>
            <button type="submit" className="btn-primary">Create Account</button>
            <p className='text-sm text-center mt-4'> Already have an account?{" "}
            <Link to='/login' className='font-medium text-primary underline'>Login </Link>

            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
