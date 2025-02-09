import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: [String], required: true}, 
    category: {type: String, required: true},
    subCategory: {type: String, required: true},
    sizes: {type: Array, required: true},
    bestseller: {type: Boolean, default: false},
    date: {type: Number, required: true},
    adminId: {type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true}
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;