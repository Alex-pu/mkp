import { Router } from 'express';
import { submitVote, submitAssignedVote } from '../controllers/vote.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { VoteSchema } from '../types';

const router = Router();

router.post('/assigned/private/:id/vote', authenticate, requireAdmin, validate(VoteSchema), submitAssignedVote);
router.post('/:id/vote', validate(VoteSchema), submitVote);

export default router;