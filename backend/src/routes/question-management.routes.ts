import { Router } from 'express';
import { updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { UpdateQuestionSchema } from '../types';

const router = Router();

router.use(authenticate, requireAdmin);

router.put('/:id', validate(UpdateQuestionSchema), updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;