import { Router } from 'express';
import { login, register, getAssignableAdmins, getManagedUsers, updateUserPassword, updateUserStatus } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireSuperAdmin } from '../middlewares/admin.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { LoginSchema, RegisterSchema, UpdateUserPasswordSchema, UpdateUserStatusSchema } from '../types';

const router = Router();

router.post('/login', authLimiter, validate(LoginSchema), login);
router.post('/register', authenticate, requireSuperAdmin, validate(RegisterSchema), register);
router.get('/admins', authenticate, requireSuperAdmin, getAssignableAdmins);
router.get('/users', authenticate, requireSuperAdmin, getManagedUsers);
router.patch('/users/:id/status', authenticate, requireSuperAdmin, validate(UpdateUserStatusSchema), updateUserStatus);
router.patch('/users/:id/password', authenticate, requireSuperAdmin, validate(UpdateUserPasswordSchema), updateUserPassword);

export default router;