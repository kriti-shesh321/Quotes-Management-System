import { Router } from 'express';
import { getTopics } from '../controllers/topicControllers';

const router = Router();
router.get('/', getTopics);

export default router;
