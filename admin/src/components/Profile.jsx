import React, { useState, useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { backendUrl } from '../App'

const Profile = () => {
    const { admin, updateAdminProfile } = useContext(AdminContext)
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('') // 'email', 'password'
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Profile fields
    const [name, setName] = useState(admin?.name || '')
    const [email, setEmail] = useState(admin?.email || '')
    
    // Email change fields
    const [newEmail, setNewEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [showVerificationField, setShowVerificationField] = useState(false)
    
    // Password change fields
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSendVerificationCode = async () => {
        if (!newEmail.includes('@')) {
            toast.error('Please enter a valid email address', { autoClose: 2000 })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await axios.post(backendUrl + '/api/admin/verify-email', 
                { email: newEmail },
                { headers: { token: localStorage.getItem('admin-token') } }
            )
            
            if (response.data.success) {
                toast.success('Verification code sent to your new email!', { autoClose: 2000 })
                setShowVerificationField(true)
            } else {
                toast.error(response.data.message || 'Failed to send code', { autoClose: 2000 })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send verification code', { autoClose: 2000 })
        }
        setIsSubmitting(false)
    }

    const handleEmailChange = async (e) => {
        e.preventDefault()
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter the 6-digit verification code', { autoClose: 2000 })
            return
        }

        setIsSubmitting(true)
        try {
            const success = await updateAdminProfile({
                email: newEmail,
                verificationCode
            })

            if (success) {
                toast.success('Email updated successfully!', { autoClose: 2000 })
                setShowModal(false)
                resetModalFields()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update email', { autoClose: 2000 })
        }
        setIsSubmitting(false)
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters', { autoClose: 2000 })
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match', { autoClose: 2000 })
            return
        }

        setIsSubmitting(true)
        try {
            const success = await updateAdminProfile({
                currentPassword,
                newPassword
            })

            if (success) {
                toast.success('Password updated successfully!', { autoClose: 2000 })
                setShowModal(false)
                resetModalFields()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password', { autoClose: 2000 })
        }
        setIsSubmitting(false)
    }

    const handleNameChange = async () => {
        if (!name.trim()) {
            toast.error('Please enter your name', { autoClose: 2000 })
            return
        }

        setIsSubmitting(true)
        try {
            const success = await updateAdminProfile({ name })
            if (success) {
                toast.success('Name updated successfully!', { autoClose: 2000 })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update name', { autoClose: 2000 })
        }
        setIsSubmitting(false)
    }

    const resetModalFields = () => {
        setNewEmail('')
        setVerificationCode('')
        setShowVerificationField(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    const renderEmailChangeModal = () => (
        <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-black focus:border-black"
                    placeholder="Enter new email"
                    required
                />
            </div>
            {!showVerificationField ? (
                <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isSubmitting}
                    className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
                >
                    Send Verification Code
                </button>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                    <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2 border rounded focus:ring-black focus:border-black"
                        placeholder="Enter 6-digit code"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-4 bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        Update Email
                    </button>
                </div>
            )}
        </form>
    )

    const renderPasswordChangeModal = () => (
        <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-black focus:border-black"
                    placeholder="Enter current password"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
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
                disabled={isSubmitting}
                className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
                Update Password
            </button>
        </form>
    )

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
            
            {/* Profile Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 p-2 border rounded focus:ring-black focus:border-black"
                            placeholder="Your name"
                        />
                        <button
                            onClick={handleNameChange}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                            Update
                        </button>
                    </div>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={email}
                            disabled
                            className="flex-1 p-2 border rounded bg-gray-50"
                        />
                        <button
                            onClick={() => {
                                setModalType('email')
                                setShowModal(true)
                            }}
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                        >
                            Change
                        </button>
                    </div>
                </div>

                <div>
                    <button
                        onClick={() => {
                            setModalType('password')
                            setShowModal(true)
                        }}
                        className="w-full p-2 bg-gray-800 text-white rounded hover:bg-black"
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {modalType === 'email' ? 'Change Email' : 'Change Password'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    resetModalFields()
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {modalType === 'email' ? renderEmailChangeModal() : renderPasswordChangeModal()}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
