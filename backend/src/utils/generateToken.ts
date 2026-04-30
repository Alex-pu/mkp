import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../types';

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};