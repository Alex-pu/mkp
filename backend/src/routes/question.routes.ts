import { Router } from 'express';
import { createQuestion, updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateQuestionSchema, UpdateQuestionSchema } from '../types';

const router = Router({ mergeParams: true });

router.use(authenticate, requireAdmin);

router.post('/', validate(CreateQuestionSchema), createQuestion);
router.put('/:id', validate(UpdateQuestionSchema), updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;