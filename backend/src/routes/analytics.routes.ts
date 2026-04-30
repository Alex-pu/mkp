import { Router } from 'express';
import { getPollAnalytics } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/:id/analytics', getPollAnalytics);

export default router;