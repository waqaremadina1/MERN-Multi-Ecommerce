import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true }
    }],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false }
}, { timestamps: true }); // ✅ Automatically handles `createdAt` & `updatedAt`

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema, "orders");
export default orderModel;
