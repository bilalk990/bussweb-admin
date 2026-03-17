import { Router } from 'express';
import { authController } from "../controllers/auth_controller";
import tokenValidationMiddleware from '../middlewares/token_validator';
import { User } from '../models/user_model';
import bcrypt from 'bcryptjs';

const router = Router();

// TEMP: Create super admin - remove after first use
router.get('/setup-admin', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
      res.json({ message: 'Super admin already exists', email: existing.email });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Admin@123', salt);
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@fastbuss.com',
      password: hashed,
      role: 'super_admin',
      is_email_verified: true,
      status: 'active'
    });
    await admin.save();
    res.json({ message: 'Super admin created!', email: 'admin@fastbuss.com', password: 'Admin@123' });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/delete-account', tokenValidationMiddleware, authController.deleteAccount);
router.post('/logout', authController.logout);
router.post("/check-token", authController.validateToken);
router.post('/change-password', tokenValidationMiddleware, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
