import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const requireAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.token;

        if (!token) {
            return res.json({ success: false, message: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await userModel.findById(decoded.id).select('-password');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: 'Invalid token' });
    }
};
