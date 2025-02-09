import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import Admin from "../models/adminModel.js"
import fs from 'fs'
import path from 'path'

// Function for add product
const addProduct = async (req,res) => {
    try {
        console.log("1. Request files:", req.files);
        console.log("2. Request body:", req.body);
        
        const { name, description, price, category, subCategory, sizes, bestseller }  = req.body
        
        // Get all image files
        const imageFiles = [];
        if (req.files && req.files.image1 && req.files.image1[0]) {
            console.log("3. Found image1:", req.files.image1[0].path);
            imageFiles.push(req.files.image1[0]);
        }
        if (req.files && req.files.image2 && req.files.image2[0]) {
            console.log("3. Found image2:", req.files.image2[0].path);
            imageFiles.push(req.files.image2[0]);
        }
        if (req.files && req.files.image3 && req.files.image3[0]) {
            console.log("3. Found image3:", req.files.image3[0].path);
            imageFiles.push(req.files.image3[0]);
        }
        if (req.files && req.files.image4 && req.files.image4[0]) {
            console.log("3. Found image4:", req.files.image4[0].path);
            imageFiles.push(req.files.image4[0]);
        }
        
        console.log("4. Total image files found:", imageFiles.length);

        if (imageFiles.length === 0) {
            return res.json({ success: false, message: "At least one image is required" });
        }

        // Upload all images to Cloudinary
        const imageUrls = [];
        for (const file of imageFiles) {
            try {
                // Check if file exists
                if (!fs.existsSync(file.path)) {
                    console.error("5. File does not exist:", file.path);
                    continue;
                }

                console.log("5. Uploading file to Cloudinary:", file.path);
                console.log("6. File details:", {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                });

                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                    folder: 'products'
                });
                
                console.log("7. Cloudinary upload result:", result);
                imageUrls.push(result.secure_url);
                
                // Clean up the uploaded file
                fs.unlinkSync(file.path);
            } catch (uploadError) {
                console.error("8. Cloudinary upload error:", uploadError);
                return res.json({ success: false, message: "Error uploading image to Cloudinary: " + uploadError.message });
            }
        }

        console.log("9. All image URLs:", imageUrls);

        const productData = {
            name,
            description,
            category, 
            price: Number(price),
            subCategory, 
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imageUrls,
            date: Date.now(),
            adminId: req.admin._id
        }

        console.log("10. Final product data:", productData);

        const product = new productModel(productData);
        await product.save();

        res.json({success: true, message: "Product Added Successfully"});

    } catch (error) {
        console.error("Error in addProduct:", error);
        res.json({success: false, message: error.message})
    }
}


// Function for list product
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find()
            .populate('adminId', 'name')
            .sort({ date: -1 });

        const productsWithAdmin = products.map(product => ({
            ...product._doc,
            adminName: product.adminId ? product.adminId.name : 'Unknown Admin',
            image: product.image.length > 0 ? product.image : ["default-image.jpg"] // Ensures image array
        }));

        res.json({ success: true, products: productsWithAdmin });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Function for removing product
const removeProduct = async (req,res) => {
     try {
        
        const {id} = req.body
        await productModel.findByIdAndDelete(id)
        res.json({success:true,message:"Product Removed Successfully"})

     } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
     }
}


// Function for single product info
const singleProduct = async (req,res) => {
    try {
        
       const {id} = req.body;
       const product = await productModel.findById(id)
            .populate('adminId', 'name');  
        
        const productWithAdmin = {
            ...product._doc,
            adminName: product.adminId ? product.adminId.name : 'Unknown Admin'
        };
        
        res.json({success:true, product: productWithAdmin});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}


export { listProduct, addProduct, removeProduct, singleProduct }