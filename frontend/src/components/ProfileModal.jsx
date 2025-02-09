import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileModal = ({ isOpen, onClose }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  // Profile update states
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Email change states
  const [newEmail, setNewEmail] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  const loadProfileData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token }
      });
      if (response.data.success) {
        setProfileData(response.data.user);
        setNewName(response.data.user.name);
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updateData = {
        name: newName !== profileData.name ? newName : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      };

      if (newPassword && newPassword !== confirmNewPassword) {
        toast.error('New passwords do not match');
        return;
      }

      const response = await axios.put(`${backendUrl}/api/user/profile`, updateData, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Profile updated successfully');
        loadProfileData();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/user/request-email-verification`,
        { newEmail },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Verification code sent to your email');
        setShowEmailVerification(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/user/verify-email`,
        { newEmail, code: emailVerificationCode },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Email updated successfully');
        loadProfileData();
        setNewEmail('');
        setEmailVerificationCode('');
        setShowEmailVerification(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 border-b">
          <div className="flex space-x-4">
            <button
              className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-black' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'email' ? 'border-b-2 border-black' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              Change Email
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'password' ? 'border-b-2 border-black' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              disabled={loading || newName === profileData.name}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
            >
              Update Profile
            </button>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={showEmailVerification}
              />
            </div>
            {showEmailVerification && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                <input
                  type="text"
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter 6-digit code"
                />
              </div>
            )}
            {!showEmailVerification ? (
              <button
                onClick={handleRequestEmailChange}
                disabled={loading || !newEmail}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
              >
                Send Verification Code
              </button>
            ) : (
              <button
                onClick={handleVerifyEmail}
                disabled={loading || !emailVerificationCode}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
              >
                Verify and Update Email
              </button>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              disabled={loading || !currentPassword || !newPassword || !confirmNewPassword}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
