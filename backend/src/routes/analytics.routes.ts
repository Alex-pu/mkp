import { Router } from 'express';
import { getPollAnalytics, getQuestionOpenTextResponses } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/:id/analytics', getPollAnalytics);
router.get('/:id/questions/:questionId/open-text-responses', getQuestionOpenTextResponses);

export default router;