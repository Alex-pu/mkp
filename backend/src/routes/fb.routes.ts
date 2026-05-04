import { Router } from 'express';
import { createFbReport, getFbSummary, getMyFbReports } from '../controllers/fb.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateFbSchema } from '../types';

const router = Router();

router.post('/', authenticate, requireAdmin, validate(CreateFbSchema), createFbReport);
router.get('/me', authenticate, requireAdmin, getMyFbReports);
router.get('/', authenticate, requireSuperAdmin, getFbSummary);

export default router;