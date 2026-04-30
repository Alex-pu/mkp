import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../config/constants';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateVoterToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};