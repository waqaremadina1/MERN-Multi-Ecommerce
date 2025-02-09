import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import Stripe from 'stripe';

// Global Variables
const currency = 'USD';
const delivery_charges = 10;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place Order - COD
const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, amount, address } = req.body;

        const itemsWithAdmin = await Promise.all(items.map(async (item) => {
            const product = await productModel.findById(item._id);
            if (!product) throw new Error(`Product with ID ${item._id} not found`);
            return { ...item, adminId: product.adminId };
        }));

        const newOrder = new orderModel({
            userId, items: itemsWithAdmin, amount, address, paymentMethod: 'COD', payment: false, date: Date.now()
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place Order - Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, amount, address } = req.body;
        const { origin } = req.headers;

        const itemsWithAdmin = await Promise.all(items.map(async (item) => {
            const product = await productModel.findById(item._id);
            if (!product) throw new Error(`Product with ID ${item._id} not found`);
            return { ...item, adminId: product.adminId };
        }));

        const newOrder = new orderModel({
            userId, items: itemsWithAdmin, amount, address, paymentMethod: 'Stripe', payment: false, date: Date.now()
        });

        await newOrder.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: currency,
                    product_data: { name: 'Order Payment' },
                    unit_amount: Math.round(amount * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(newOrder._id)}`,
            cancel_url: `${origin}/cart`
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Stripe Payment
const verifyStripe = async (req, res) => {
    try {
        const { session_id, order_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!order_id || !await orderModel.findById(order_id)) {
            return res.json({ success: false, message: 'Invalid order ID' });
        }

        if (session.payment_status === 'paid') {
            await orderModel.findByIdAndUpdate(order_id, { payment: true });
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Fetch All Orders for Seller (Only Seller's Own Products)
const allOrders = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const orders = await orderModel.find({ 'items.adminId': adminId }).sort({ date: -1 });

        const filteredOrders = orders.map(order => ({
            ...order._doc,
            items: order.items.filter(item => item.adminId.toString() === adminId.toString())
        })).filter(order => order.items.length > 0); // Remove empty orders

        res.json({ success: true, orders: filteredOrders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Fetch User Orders
const userOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status (For Seller)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const adminId = req.admin._id;

        // Check if the order exists and contains seller's products
        const order = await orderModel.findOne({ _id: orderId, 'items.adminId': adminId });
        if (!order) {
            return res.json({ success: false, message: "Order not found or you don't have permission" });
        }

        // Update order status
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Order Status Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe };
