import express from 'express';
import { listProduct, addProduct, removeProduct, singleProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import productModel from '../models/productModel.js';
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

const productRouter = express.Router();

// Get products for specific admin
productRouter.get('/admin-products', adminAuth, async (req, res) => {
    try {
        const products = await productModel.find({ adminId: req.admin._id })
            .select('-__v')
            .lean();
        
        if (!products.length) {
            return res.json({ success: false, message: "No products found" });
        }
        
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Add product with Cloudinary upload
productRouter.post('/add', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 }, 
    { name: 'image2', maxCount: 1 }, 
    { name: 'image3', maxCount: 1 }, 
    { name: 'image4', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Handle Image Upload to Cloudinary
        const imageFiles = [];
        if (req.files.image1) imageFiles.push(req.files.image1[0]);
        if (req.files.image2) imageFiles.push(req.files.image2[0]);
        if (req.files.image3) imageFiles.push(req.files.image3[0]);
        if (req.files.image4) imageFiles.push(req.files.image4[0]);

        if (imageFiles.length === 0) {
            return res.json({ success: false, message: "At least one image is required" });
        }

        // Upload images to Cloudinary
        const imageUrls = [];
        for (const file of imageFiles) {
            const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
            imageUrls.push(result.secure_url);
            fs.unlinkSync(file.path); // Delete local file after upload
        }

        // Create new product with Cloudinary images
        const product = new productModel({
            name,
            description,
            price,
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === 'true',
            image: imageUrls, // Store Cloudinary URLs
            date: Date.now(),
            adminId: req.admin._id
        });

        await product.save();
        res.json({ success: true, message: "Product Added Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Remove product (Only admin who added the product can remove it)
productRouter.post('/remove', adminAuth, async (req, res) => {
    try {
        const { id } = req.body;
        const product = await productModel.findOne({ _id: id, adminId: req.admin._id });
        if (!product) {
            return res.json({ success: false, message: "Product not found or unauthorized" });
        }

        // Delete images from Cloudinary
        for (const imageUrl of product.image) {
            const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public_id from URL
            await cloudinary.uploader.destroy(`products/${publicId}`);
        }

        await productModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Product Removed Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

productRouter.post('/single', singleProduct);
productRouter.get('/list', listProduct);

export default productRouter;
