import React, { useState, useContext } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { AdminContext } from '../context/AdminContext'

const ResetPasswordModal = ({ isOpen, onClose, email }) => {
    const [verificationCode, setVerificationCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        setLoading(true)
        try {
            const response = await axios.post(backendUrl + '/api/admin/reset-password', {
                email,
                code: verificationCode,
                newPassword
            })
            
            if (response.data.success) {
                toast.success('Password reset successful! Please login.')
                onClose()
            } else {
                toast.error(response.data.message || 'Failed to reset password')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password')
        }
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold cursor-pointer">Reset Password</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                            placeholder="Enter 6-digit code"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                            placeholder="Enter new password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    )
}

const VerificationModal = ({ isOpen, onClose, onVerify, loading }) => {
    const [verificationCode, setVerificationCode] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!verificationCode.trim() || verificationCode.length !== 6) {
            toast.error('Please enter the 6-digit verification code')
            return
        }
        onVerify(verificationCode)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Verify Your Email</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                            placeholder="Enter 6-digit code"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                    >
                        Verify & Register
                    </button>
                </form>
            </div>
        </div>
    )
}

const Login = () => {
    const { login, register } = useContext(AdminContext)
    const [currentState, setCurrentState] = useState('Login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [registrationData, setRegistrationData] = useState(null)

    const validateForm = () => {
        if (!email.trim() || !email.includes('@')) {
            toast.error('Please enter a valid email address')
            return false
        }
        if (!password.trim()) {
            toast.error('Please enter your password')
            return false
        }
        if (currentState === 'Sign Up') {
            if (!name.trim()) {
                toast.error('Please enter your name')
                return false
            }
            if (password !== confirmPassword) {
                toast.error('Passwords do not match')
                return false
            }
            if (password.length < 8) {
                toast.error('Password must be at least 8 characters long')
                return false
            }
        }
        return true
    }

    const handleForgotPassword = async () => {
        try {
            if (!email.trim() || !email.includes('@')) {
                toast.error('Please enter a valid email address')
                return
            }

            setIsSubmitting(true)
            const response = await axios.post(backendUrl + '/api/admin/forgot-password', { email })
            
            if (response.data.success) {
                setResetEmail(email)
                setShowResetModal(true)
                toast.success('Verification code sent to your email!')
            } else {
                toast.error(response.data.message || 'Failed to send verification code')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process request')
        }
        setIsSubmitting(false)
    }

    const handleSendVerificationCode = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/admin/send-verification', {
                name,
                email,
                password
            })
            
            if (response.data.success) {
                setRegistrationData({ name, email, password })
                setShowVerificationModal(true)
                toast.success('Verification code sent to your email!')
            } else {
                toast.error(response.data.message || 'Failed to send verification code')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send verification code')
        }
    }

    const handleVerifyAndRegister = async (code) => {
        setIsSubmitting(true)
        try {
            const success = await register(registrationData.name, registrationData.email, registrationData.password, code)
            if (success) {
                setShowVerificationModal(false)
                resetForm()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        }
        setIsSubmitting(false)
    }

    const resetForm = () => {
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setName('')
        setRegistrationData(null)
    }

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault()
            
            if (isSubmitting) return
            
            if (!validateForm()) return

            setIsSubmitting(true)

            if (currentState === 'Login') {
                const success = await login(email, password)
                if (!success) {
                    setIsSubmitting(false)
                    return
                }
            } else if (currentState === 'Sign Up') {
                await handleSendVerificationCode()
                setIsSubmitting(false)
                return
            } else if (currentState === 'Forgot Password') {
                e.preventDefault()
                handleForgotPassword()
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'An unexpected error occurred')
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className='flex flex-col items-center justify-center min-h-screen w-full px-4'>
            <h1 className="text-center mb-6 font-semibold text-4xl text-gray-800 tracking-wide">Admin Panel</h1>
                <div className='flex flex-col items-center mb-8'>
                    <p className='prata-regular text-3xl'>{currentState}</p>
                    <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
                </div>
                
                <form onSubmit={onSubmitHandler} className='w-full max-w-md space-y-4'>
                    {currentState === 'Sign Up' && (
                        <div>
                            <input 
                                onChange={(e) => setName(e.target.value)} 
                                value={name} 
                                className='w-full px-3 py-2 border border-gray-800' 
                                type="text" 
                                placeholder='Name' 
                                required 
                            />
                        </div>
                    )}

                    {currentState === 'Forgot Password' && (
                        <p className="text-gray-600 text-sm mb-4">
                            Enter your email address and we'll send you a verification code to reset your password.
                        </p>
                    )}

                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        className='w-full px-3 py-2 border border-gray-800' 
                        type="email" 
                        placeholder='Email' 
                        required 
                    />
                    
                    {(currentState === 'Login' || currentState === 'Sign Up') && (
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password} 
                            className='w-full px-3 py-2 border border-gray-800' 
                            type="password" 
                            placeholder='Password' 
                            required 
                        />
                    )}
                    
                    {currentState === 'Sign Up' && (
                        <input 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            value={confirmPassword} 
                            className='w-full px-3 py-2 border border-gray-800' 
                            type="password" 
                            placeholder='Confirm Password' 
                            required 
                        />
                    )}
                    
                    {currentState === 'Login' && (
                        <div className='w-full flex justify-between text-sm mt-[-8px]'>
                            <p 
                                className='cursor-pointer hover:text-black' 
                                onClick={() => {
                                    setCurrentState('Forgot Password')
                                    resetForm()
                                }}
                            >
                                Forgot password
                            </p>
                            <p 
                                onClick={() => {
                                    setCurrentState('Sign Up')
                                    resetForm()
                                }} 
                                className='cursor-pointer hover:text-black cursor-pointer'
                            >
                                Create account
                            </p>
                        </div>
                    )}

                    {currentState === 'Sign Up' && (
                        <div className='w-full flex justify-end text-sm mt-[-8px]'>
                            <p 
                                onClick={() => {
                                    setCurrentState('Login')
                                    resetForm()
                                }} 
                                className='cursor-pointer hover:text-black'
                            >
                                Login Here
                            </p>
                        </div>
                    )}

                    {currentState === 'Forgot Password' && (
                        <div className='w-full flex justify-end text-sm mt-[-8px]'>
                            <p 
                                onClick={() => {
                                    setCurrentState('Login')
                                    resetForm()
                                }} 
                                className='cursor-pointer hover:text-black'
                            >
                                Back to Login
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        onClick={(e) => {
                            if (currentState === 'Forgot Password') {
                                e.preventDefault()
                                handleForgotPassword()
                            }
                        }}
                        className='bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer w-full disabled:opacity-50'
                    >
                        {currentState === 'Login' ? 'Sign In' : 
                         currentState === 'Sign Up' ? 'Sign Up' : 
                         'Send Reset Code'}
                    </button>
                </form>
            </div>

            <ResetPasswordModal 
                isOpen={showResetModal} 
                onClose={() => setShowResetModal(false)} 
                email={resetEmail} 
            />

            <VerificationModal 
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onVerify={handleVerifyAndRegister}
                loading={isSubmitting}
            />
        </>
    )
}

export default Login