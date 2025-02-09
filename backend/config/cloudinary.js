import { v2 as cloudinary } from "cloudinary";
import 'dotenv/config';

const connectCloudinary = () => {
    try {
        // Validate required environment variables
        const requiredEnvVars = ['CLOUDINARY_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_SECRET_KEY'];
        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        
        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });

        // Test Cloudinary connection
        cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", 
            {
                resource_type: "auto",
                folder: "test"
            })
            .then(result => {
                console.log("✅ Cloudinary connected successfully");
                console.log("Cloudinary Configuration:", {
                    cloud_name: process.env.CLOUDINARY_NAME,
                    api_key: "Present",
                    api_secret: "Present"
                });
            })
            .catch(error => {
                console.error("❌ Cloudinary connection test failed:", error);
                throw error;
            });

        return true;
    } catch (error) {
        console.error("❌ Cloudinary Configuration Error:", error);
        return false;
    }
};

export default connectCloudinary;