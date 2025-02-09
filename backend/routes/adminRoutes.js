import express from 'express';
import Admin from '../models/adminModel.js';
import jwt from 'jsonwebtoken';
import adminAuth from '../middleware/adminAuth.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

// Register new admin
router.post('/send-verification', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.json({ success: false, message: "Admin already exists with this email" });
        }

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        
        // Store verification data temporarily
        const tempAdmin = new Admin({
            name,
            email,
            password,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: Date.now() + 3600000 // 1 hour
        });
        await tempAdmin.save();

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
        
        // Find temp admin with verification code
        const admin = await Admin.findOne({
            email,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.json({ success: false, message: "Invalid or expired verification code" });
        }

        // Clear verification fields
        admin.emailVerificationCode = undefined;
        admin.emailVerificationExpires = undefined;
        await admin.save();

        // Generate token
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET);

        res.json({ 
            success: true, 
            token, 
            admin: { name: admin.name, email: admin.email },
            message: "Registration successful!"
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Login admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET);

        res.json({ success: true, token, admin: { name: admin.name, email: admin.email } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get admin profile
router.get('/profile', adminAuth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');
        res.json({ success: true, admin });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Verify email for change
router.post('/verify-email', adminAuth, async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if email is already in use by another admin
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin && existingAdmin._id.toString() !== req.admin._id.toString()) {
            return res.json({ success: false, message: "Email is already in use" });
        }

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        
        // Save the code to admin document
        const admin = await Admin.findById(req.admin._id);
        admin.emailVerificationCode = verificationCode;
        admin.emailVerificationExpires = Date.now() + 3600000; // 1 hour
        admin.newEmail = email; // Store the new email temporarily
        await admin.save();

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
            text: `Your email verification code is: ${verificationCode}`
        });

        res.json({ success: true, message: "Verification code sent to your email" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Update admin profile
router.put('/profile', adminAuth, async (req, res) => {
    try {
        const { name, email, verificationCode, currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id);

        // Update name if provided
        if (name) {
            admin.name = name;
        }

        // Update email if verification code is provided
        if (email && verificationCode) {
            if (admin.emailVerificationCode !== verificationCode || 
                admin.emailVerificationExpires < Date.now() ||
                admin.newEmail !== email) {
                return res.json({ success: false, message: "Invalid or expired verification code" });
            }
            admin.email = email;
            admin.emailVerificationCode = undefined;
            admin.emailVerificationExpires = undefined;
            admin.newEmail = undefined;
        }

        // Update password if both current and new passwords are provided
        if (currentPassword && newPassword) {
            const isMatch = await admin.comparePassword(currentPassword);
            if (!isMatch) {
                return res.json({ success: false, message: "Current password is incorrect" });
            }
            admin.password = newPassword;
        }

        await admin.save();
        res.json({ 
            success: true, 
            admin: { 
                name: admin.name, 
                email: admin.email 
            },
            message: "Profile updated successfully" 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomInt(100000, 999999).toString();
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await admin.save();

        // Send email
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
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetToken}`
        });

        res.json({ success: true, message: "Password reset code sent to your email" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const admin = await Admin.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.json({ success: false, message: "Invalid or expired reset code" });
        }

        admin.password = newPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get dashboard stats
router.get('/dashboard', adminAuth, getDashboardStats);

export default router;
