import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        
        if (!token) {
            return res.json({success: false, message: "Not Authorized. Please login again"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.json({success: false, message: "Admin not found"});
        }

        req.admin = admin;
        next();

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
};

export default adminAuth;