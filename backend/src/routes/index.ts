import { Router } from 'express';
import authRoutes from './auth.routes';
import pollRoutes from './poll.routes';
import questionRoutes from './question.routes';
import questionManagementRoutes from './question-management.routes';
import voteRoutes from './vote.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/polls/:pollId/questions', questionRoutes);
router.use('/questions', questionManagementRoutes);
router.use('/polls', voteRoutes);
router.use('/polls', analyticsRoutes);

export default router;
