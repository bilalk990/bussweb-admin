import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user_model';
import { generateToken } from '../utils/jwt';
import { redisController } from './redis_controller';
import { sendOTP } from '../services/email_service';
import TokenBlacklist from '../models/token_blacklist_model';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const authController = {

    validateToken: async (req: Request, res: Response) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ success: false, message: "No token provided" });
            }

            const token = authHeader.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET!);

            return res.status(200).json({
                success: true,
                message: "Token is valid",
                data: decoded,
            });
        } catch (err: any) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token has expired",
                });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token",
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: "Could not validate token",
                });
            }
        }
    },

    register: async (req: Request, res: Response) => {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({ message: "Name, Email, and Password are required" });
                return;
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                res.status(400).json({ message: 'Email already exists' });
                return;
            }

            if (role) {
                const validRoles = ["user", "sub_admin", "super_admin", "driver", "staff"];
                if (!validRoles.includes(role)) {
                    res.status(400).json({ message: "Invalid role" });
                    return;
                }
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || "user",
                status: "active"
            });

            const token = generateToken(user);

            res.status(201).json({ message: 'User registered successfully', token });
        } catch (err) {
            console.error("Registration error:", err);
            res.status(500).json({ message: 'Registration failed', error: err });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password, is_driver } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "Email and Password are required" });
                return;
            }

            const where: any = { email };
            if (is_driver) {
                where.role = "driver";
            }

            const user = await User.findOne({ where });
            if (!user) {
                res.status(404).json({ message: 'Invalid Credentials' });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            const token = generateToken(user);

            // Only enforce email verification for regular users, not admin/staff roles
            const adminRoles = ['super_admin', 'sub_admin', 'staff', 'driver'];
            if (!adminRoles.includes(user.role) && !user.is_email_verified) {
                res.status(405).json({ message: 'Email not verified', token: token });
                return;
            }

            if (user.status === "banned" || user.status === "blocked") {
                res.status(407).json({ message: `User account is ${user.status}`, token: token });
                return;
            }

            res.status(200).json({ message: 'Login successful', token });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: 'Login failed', error: err });
        }
    },

    sendOtp: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }

            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            await redisController.saveOtpToStore(email, otp);
            await sendOTP(email, otp);

            res.status(200).json({ message: "OTP sent" });
        } catch (error) {
            console.error("❌ Error in sendOtp:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    verifyOtp: async (req: Request, res: Response) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({ message: "Email and OTP are required" });
                return;
            }
            const savedOtp = await redisController.getOtpFromStore(email);
            if (!savedOtp || savedOtp !== otp) {
                res.status(400).json({ message: "Invalid or expired OTP" });
                return;
            }
            const user = await User.findOne({ where: { email } });
            if (user && !user.emailVerifiedAt) {
                await user.update({ emailVerifiedAt: new Date() });
            }
            await redisController.removeOtp(email);
            res.status(200).json({ message: "OTP verified successfully" });
        } catch (error) {
            console.error("❌ Error in verifyOtp:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    deleteAccount: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            await user.destroy();

            res.status(200).json({ message: "Account deleted successfully." });
        } catch (error) {
            console.error("❌ Error deleting account:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    logout: async (req: Request, res: Response) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                res.status(400).json({ message: "No token provided" });
                return;
            }
            // Note: tokenBlacklistSchema is still Mongoose-based. 
            // This might need refactoring too if we migrate all models.
            await TokenBlacklist.create({ token });

            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            console.error("❌ Error logging out:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    changePassword: async (req: Request, res: Response) => {
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                res.status(400).json({ message: "Old password and new password are required" });
                return;
            }

            const user = await User.findByPk(res.locals.userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                res.status(401).json({ message: "Invalid old password" });
                return;
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                res.status(400).json({ message: "New password cannot be the same as the old password" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await user.update({ password: hashedPassword });

            res.status(200).json({ message: "Password changed successfully" });
        } catch (error) {
            console.error("❌ Error changing password:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    forgotPassword: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            await redisController.saveOtpToStore(email, otp);
            await sendOTP(email, otp);

            res.status(200).json({ message: "OTP sent to email" });

        } catch (error) {
            console.error("❌ Error sending forgot password OTP:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    resetPassword: async (req: Request, res: Response) => {
        try {
            const { email, newPassword } = req.body;
            if (!email || !newPassword) {
                res.status(400).json({ message: "Email and new password are required" });
                return;
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await user.update({ password: hashedPassword });

            await redisController.removeOtp(email);

            res.status(200).json({ message: "Password reset successfully" });
        } catch (error) {
            console.error("❌ Error resetting password:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

};

