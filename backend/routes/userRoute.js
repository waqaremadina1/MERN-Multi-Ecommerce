import express from 'express'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import { 
    loginUser, 
    registerUser, 
    adminLogin, 
    getUserProfile,
    updateProfile,
    requestEmailVerification,
    verifyAndUpdateEmail,
    requestPasswordReset,
    resetPassword
} from '../controllers/userController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = express.Router()

// Auth routes
router.post('/login', loginUser)
router.post('/admin-login', adminLogin)

// Profile management (requires authentication)
router.get('/profile', requireAuth, getUserProfile)
router.put('/profile', requireAuth, updateProfile)
router.post('/request-email-verification', requireAuth, requestEmailVerification)
router.post('/verify-email', requireAuth, verifyAndUpdateEmail)

// Password reset (no auth required)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPassword)

// Registration with email verification
router.post('/send-verification', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists with this email" });
        }

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        
        // Store verification data temporarily
        const tempUser = new User({
            name,
            email,
            password,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: Date.now() + 3600000 // 1 hour
        });
        await tempUser.save();

        // Send verification code
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification Code',
            text: `Your registration verification code is: ${verificationCode}`
        });

        res.json({ success: true, message: "Verification code sent to your email" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, verificationCode } = req.body;
        
        // Find temp user with verification code
        const user = await User.findOne({
            email,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired verification code" });
        }

        // Clear verification fields
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.json({ 
            success: true, 
            token,
            message: "Registration successful!"
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default router