import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'

const Dashboard = () => {
    const { backendUrl, token } = useContext(AdminContext)
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    })

    const loadStats = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                headers: { token }
            })
            if (response.data.success) {
                setStats(response.data.stats)
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error)
        }
    }

    useEffect(() => {
        loadStats()
        // Refresh stats every minute
        const interval = setInterval(loadStats, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="p-6 text-center">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
            
           <p>A dashboard in an eCommerce website displays sales, orders, revenue,
             customer insights, inventory status, and performance metrics for efficient management.</p>

             

        </div>
    )
}

export default Dashboard
