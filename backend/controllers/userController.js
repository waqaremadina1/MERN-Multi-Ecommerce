import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import nodemailer from "nodemailer"

const createToken = (id) => {
     return jwt.sign({id},process.env.JWT_SECRET)
}

// Email verification code storage (in memory for demo, should use Redis in production)
const verificationCodes = new Map();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'waqaremadina1@gmail.com',
        pass: 'htiorwjaahfymxwj' // Gmail App Password
    }
});

// Test email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send messages');
    }
});

const sendVerificationCode = async (email) => {
    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(email, {
            code,
            timestamp: Date.now()
        });

        const mailOptions = {
            from: {
                name: 'E-commerce Support',
                address: 'waqaremadina1@gmail.com'
            },
            to: email,
            subject: 'Password Reset Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Verification Code</h2>
                    <p style="font-size: 16px; color: #666;">Your verification code is:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #333; margin: 0; letter-spacing: 5px;">${code}</h1>
                    </div>
                    <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #999;">If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent successfully:', {
            messageId: info.messageId,
            response: info.response
        });
        return code;
    } catch (error) {
        console.error('Email error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw new Error(`Failed to send verification code: ${error.message}`);
    }
};

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Checking user exists
        const user = await userModel.findOne({ email });

        if (!user) {
            // User not found
            return res.json({ success: false, message: "User doesn't exist" });
        }

        // Checking if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Password doesn't match
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // If credentials are valid, generate token
        const token = createToken(user._id);

        // Return success, message and token
        return res.json({
            success: true,
            message: "Successfully logged in!",
            token,
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for user register
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // Checking user already exists or not
        const exists = await userModel.findOne({email});

        if (exists) {
            return res.json({success:false, message: "User already exists"})
        }

        // Validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false, message: "Please enter a valid email"})
        }
        if (password.length < 8) {
            return res.json({success:false, message: "Please enter a strong password"})
        }
     
        // Hashing user password
        const  salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        
        const newUser = new userModel ({
            name,
            email,
            password:hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }


}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true, token})
        }else{
            res.json({success:false, message:"Invalid credentials"})
        }


    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }

}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const user = await userModel.findById(req.user.id);

        if (name) {
            user.name = name;
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Current password is incorrect" });
            }

            if (newPassword.length < 8) {
                return res.json({ success: false, message: "New password must be at least 8 characters" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Request email verification code
const requestEmailVerification = async (req, res) => {
    try {
        const { newEmail } = req.body;
        
        if (!validator.isEmail(newEmail)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const existingUser = await userModel.findOne({ email: newEmail });
        if (existingUser) {
            return res.json({ success: false, message: "Email already in use" });
        }

        await sendVerificationCode(newEmail);
        res.json({ success: true, message: "Verification code sent" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify email and update
const verifyAndUpdateEmail = async (req, res) => {
    try {
        const { newEmail, code } = req.body;
        const verification = verificationCodes.get(newEmail);

        if (!verification || verification.code !== code) {
            return res.json({ success: false, message: "Invalid verification code" });
        }

        if (Date.now() - verification.timestamp > 600000) { // 10 minutes expiry
            verificationCodes.delete(newEmail);
            return res.json({ success: false, message: "Verification code expired" });
        }

        const user = await userModel.findById(req.user.id);
        user.email = newEmail;
        await user.save();

        verificationCodes.delete(newEmail);
        res.json({ success: true, message: "Email updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        await sendVerificationCode(email);
        res.json({ success: true, message: "Password reset code sent" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Reset password with verification code
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const verification = verificationCodes.get(email);

        if (!verification || verification.code !== code) {
            return res.json({ success: false, message: "Invalid verification code" });
        }

        if (Date.now() - verification.timestamp > 600000) { // 10 minutes expiry
            verificationCodes.delete(email);
            return res.json({ success: false, message: "Verification code expired" });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const user = await userModel.findOne({ email });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        verificationCodes.delete(email);
        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { 
    loginUser, 
    registerUser, 
    adminLogin, 
    getUserProfile,
    updateProfile,
    requestEmailVerification,
    verifyAndUpdateEmail,
    requestPasswordReset,
    resetPassword
}