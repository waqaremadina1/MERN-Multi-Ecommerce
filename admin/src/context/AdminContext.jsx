import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export const AdminContext = createContext(null)

const AdminContextProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('admin-token'))
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

    // Load admin data on token change
    useEffect(() => {
        const loadAdminData = async () => {
            try {
                if (!token) {
                    setLoading(false)
                    return
                }

                const response = await axios.get(`${backendUrl}/api/admin/profile`, {
                    headers: { token }
                })

                if (response.data.success) {
                    setAdmin(response.data.admin)
                } else {
                    localStorage.removeItem('admin-token')
                    setToken(null)
                }
            } catch (error) {
                console.error('Error loading admin data:', error)
                toast.error('Error loading admin data', { autoClose: 2000 })
                localStorage.removeItem('admin-token')
                setToken(null)
            } finally {
                setLoading(false)
            }
        }

        loadAdminData()
    }, [token])

    // Register function
    const register = async (name, email, password, verificationCode) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/register`, {
                name,
                email,
                password,
                verificationCode
            })

            if (response.data.success) {
                localStorage.setItem('admin-token', response.data.token)
                setToken(response.data.token)
                setAdmin(response.data.admin)
                toast.success('Successfully registered!', { autoClose: 2000 })
                return true
            } else {
                toast.error(response.data.message || 'Registration failed', { autoClose: 2000 })
                return false
            }
        } catch (error) {
            console.error('Registration error:', error)
            if (error.response?.status === 409) {
                toast.error('Email already registered', { autoClose: 2000 })
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Invalid details', { autoClose: 2000 })
            } else {
                toast.error('Registration failed', { autoClose: 2000 })
            }
            return false
        }
    }

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${backendUrl}/api/admin/login`, {
                email,
                password
            })

            if (response.data.success) {
                localStorage.setItem('admin-token', response.data.token)
                setToken(response.data.token)
                setAdmin(response.data.admin)
                toast.success('Welcome back!', { autoClose: 2000 })
                return true
            } else {
                toast.error(response.data.message || 'Login failed', { autoClose: 2000 })
                return false
            }
        } catch (error) {
            console.error('Login error:', error)
            if (error.response?.status === 404) {
                toast.error('Account not found', { autoClose: 2000 })
            } else if (error.response?.status === 401) {
                toast.error('Invalid email or password', { autoClose: 2000 })
            } else {
                toast.error('Login failed', { autoClose: 2000 })
            }
            return false
        }
    }

    // Logout function
    const logout = () => {
        try {
            localStorage.removeItem('admin-token');
            sessionStorage.clear();
            setToken(null);
            setAdmin(null);
            setLoading(false);
            toast.success('Logged out!', { autoClose: 2000 })
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed', { autoClose: 2000 })
            localStorage.removeItem('admin-token');
            setToken(null);
        }
    }

    // Update admin profile
    const updateAdminProfile = async (updateData) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/admin/profile`,
                updateData,
                { headers: { token: localStorage.getItem('admin-token') } }
            );

            if (response.data.success) {
                setAdmin(response.data.admin);
                return true;
            } else {
                toast.error(response.data.message || 'Update failed', { autoClose: 2000 });
                return false;
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile', { autoClose: 2000 });
            return false;
        }
    };

    const contextValue = {
        admin,
        token,
        loading,
        login,
        register,
        logout,
        updateAdminProfile
    }

    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
