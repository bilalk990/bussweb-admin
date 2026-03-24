
import jwt from 'jsonwebtoken';
import { IUser } from '../types/user_types';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id || user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2d' }
  );
};
