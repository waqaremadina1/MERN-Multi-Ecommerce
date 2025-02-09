import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Auth = ({ setToken }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            let response;

            if (isResetPassword) {
                if (!codeSent) {
                    response = await axios.post(backendUrl + '/api/admin/forgot-password', { email });
                    if (response.data.success) {
                        setCodeSent(true);
                        toast.success('Reset code sent to your email');
                    }
                } else {
                    response = await axios.post(backendUrl + '/api/admin/reset-password', {
                        email,
                        code: resetCode,
                        newPassword
                    });
                    if (response.data.success) {
                        toast.success('Password reset successfully');
                        setIsResetPassword(false);
                        setCodeSent(false);
                    }
                }
            } else {
                const endpoint = isLogin ? '/api/admin/login' : '/api/admin/register';
                const data = isLogin ? { email, password } : { name, email, password };
                
                response = await axios.post(backendUrl + endpoint, data);
                if (response.data.success) {
                    setToken(response.data.token);
                    toast.success(isLogin ? 'Login successful' : 'Registration successful');
                }
            }

            if (!response.data.success) {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    if (isResetPassword) {
        return (
            <div className='min-h-screen flex items-center justify-center w-full'>
                <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
                    <h1 className='text-2xl font-bold mb-4'>Reset Password</h1>
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3 min-w-72'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                                type="email"
                                placeholder='your@email.com'
                                required
                            />
                        </div>
                        {codeSent && (
                            <>
                                <div className='mb-3 min-w-72'>
                                    <p className='text-sm font-medium text-gray-700 mb-2'>Reset Code</p>
                                    <input
                                        onChange={(e) => setResetCode(e.target.value)}
                                        value={resetCode}
                                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                                        type="text"
                                        placeholder='Enter 6-digit code'
                                        required
                                    />
                                </div>
                                <div className='mb-3 min-w-72'>
                                    <p className='text-sm font-medium text-gray-700 mb-2'>New Password</p>
                                    <input
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        value={newPassword}
                                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
                                        type="password"
                                        placeholder='Enter new password'
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black cursor-pointer' type='submit'>
                            {codeSent ? 'Reset Password' : 'Send Reset Code'}
                        </button>
                        <p className='mt-4 text-center'>
                            <span
                                className='text-blue-600 cursor-pointer'
                                onClick={() => {
                                    setIsResetPassword(false);
                                    setCodeSent(false);
                                }}
                            >
                                Back to login
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full'>
                <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 px-4 rounded ${isLogin ? 'bg-black text-white' : 'bg-gray-100'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 px-4 rounded ${!isLogin ? 'bg-black text-white' : 'bg-gray-100'}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className='mb-3'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Full Name</p>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                                type="text" 
                                placeholder='Enter your name'
                                required={!isLogin}
                            />
                        </div>
                    )}
                    
                    <div className='mb-3'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                        <input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                            type="email" 
                            placeholder='your@email.com'
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                        <input 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                            type="password" 
                            placeholder='Enter your password'
                            required
                        />
                    </div>

                    <button 
                        type='submit'
                        className='mt-4 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-800'
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                    {isLogin && (
                        <p className='mt-4 text-center'>
                            <span
                                className='text-blue-600 cursor-pointer'
                                onClick={() => setIsResetPassword(true)}
                            >
                                Forgot password?
                            </span>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Auth;
