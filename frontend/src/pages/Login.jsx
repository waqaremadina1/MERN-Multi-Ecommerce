import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios';
import { toast } from 'react-toastify';

const VerificationModal = ({ isOpen, onClose, onVerify, loading }) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    onVerify(verificationCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold cursor-pointer">Verify Your Email</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          >
            Verify & Register
          </button>
        </form>
      </div>
    </div>
  );
};

const ResetPasswordModal = ({ isOpen, onClose, email }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(ShopContext);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
        email,
        code: verificationCode,
        newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully');
        onClose();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold cursor-pointer">Reset Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Confirm new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [registrationData, setRegistrationData] = useState(null);

  const validateForm = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return false;
    }
    if (currentState === 'Sign Up') {
      if (!name.trim()) {
        toast.error('Please enter your name');
        return false;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return false;
      }
    }
    return true;
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        toast.error('Please enter your email first');
        return;
      }

      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      if (response.data.success) {
        setResetEmail(email);
        setShowResetModal(true);
        toast.success('Verification code sent to your email');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send reset code');
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/send-verification`, {
        name,
        email,
        password
      });

      if (response.data.success) {
        setRegistrationData({ name, email, password });
        setShowVerificationModal(true);
        toast.success('Verification code sent to your email');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send verification code');
    }
  };

  const handleVerifyAndRegister = async (code) => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        ...registrationData,
        verificationCode: code
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setShowVerificationModal(false);
        toast.success('Successfully registered!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (currentState === 'Sign Up') {
        await handleSendVerificationCode();
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <>
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='prata-regular text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>
        {currentState === 'Sign Up' && (
          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            type="text" 
            className='w-full px-3 py-2 border border-gray-800' 
            placeholder='Name' 
            required 
          />
        )}
        <input 
          onChange={(e) => setEmail(e.target.value)} 
          value={email} 
          type="email" 
          className='w-full px-3 py-2 border border-gray-800' 
          placeholder='Email' 
          required 
        />
        <input 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
          type="password" 
          className='w-full px-3 py-2 border border-gray-800' 
          placeholder='Password' 
          required 
        />
        {currentState === 'Sign Up' && (
          <input 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            value={confirmPassword} 
            type="password" 
            className='w-full px-3 py-2 border border-gray-800' 
            placeholder='Confirm Password' 
            required 
          />
        )}
        <button 
          disabled={loading}
          className='w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 cursor-pointer' 
          type='submit'
        >
          {currentState}
        </button>
        
        <div className='mt-4 flex justify-between text-sm w-full'>
          <button 
            type="button"
            onClick={() => {
              setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login');
              setPassword('');
              setConfirmPassword('');
            }} 
            className='text-blue-600 hover:underline'
          >
            {currentState === 'Login' ? 'Create new account' : 'Already have an account?'}
          </button>
          {currentState === 'Login' && (
            <button 
              type="button"
              onClick={handleForgotPassword} 
              className='text-blue-600 hover:underline cursor-pointer'
            >
              Forgot Password?
            </button>
          )}
        </div>
      </form>

      <ResetPasswordModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
        email={resetEmail} 
      />

      <VerificationModal 
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerifyAndRegister}
        loading={loading}
      />
    </>
  );
};

export default Login