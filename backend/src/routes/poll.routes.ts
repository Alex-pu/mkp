import { Router } from 'express';
import { getPolls, getPoll, createPoll, updatePoll, deletePoll, getPublicPolls, getPublicPoll, getAssignedPrivatePolls, getAssignedPrivatePoll } from '../controllers/poll.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreatePollSchema, UpdatePollSchema } from '../types';

const router = Router();

// Public routes
router.get('/public', getPublicPolls);
router.get('/assigned/private', authenticate, requireAdmin, getAssignedPrivatePolls);
router.get('/assigned/private/:id', authenticate, requireAdmin, getAssignedPrivatePoll);
router.get('/:id/public', getPublicPoll);

// Protected routes
router.get('/', authenticate, requireAdmin, getPolls);
router.post('/', authenticate, requireAdmin, validate(CreatePollSchema), createPoll);
router.get('/:id', authenticate, requireAdmin, getPoll);
router.put('/:id', authenticate, requireAdmin, validate(UpdatePollSchema), updatePoll);
router.delete('/:id', authenticate, requireAdmin, deletePoll);

export default router;