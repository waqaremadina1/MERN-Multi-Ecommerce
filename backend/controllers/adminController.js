import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js"

// Get dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const adminId = req.admin._id

        // Get total products for this admin
        const totalProducts = await productModel.countDocuments({ adminId })

        // Get orders containing products from this admin
        const orders = await orderModel.find({
            "items.adminId": adminId
        })

        // Calculate stats
        let totalRevenue = 0
        let pendingOrders = 0

        orders.forEach(order => {
            // Only count items belonging to this admin
            order.items.forEach(item => {
                if (item.adminId.toString() === adminId.toString()) {
                    totalRevenue += item.price * item.quantity
                }
            })

            // Count pending orders (any order not marked as delivered)
            if (order.status !== 'Delivered') {
                pendingOrders++
            }
        })

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders: orders.length,
                totalRevenue,
                pendingOrders
            }
        })

    } catch (error) {
        console.error('Dashboard stats error:', error)
        res.json({ success: false, message: error.message })
    }
}

export { getDashboardStats }
