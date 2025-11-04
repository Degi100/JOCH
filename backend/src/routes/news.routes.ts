import { Router } from 'express';
import {
  getAllNews,
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/news.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.get('/published', getPublishedNews);
router.get('/:id', getNewsById);

// Protected routes (Admin only)
router.get('/', authenticate, authorize('admin'), getAllNews);
router.post('/', authenticate, authorize('admin'), createNews);
router.put('/:id', authenticate, authorize('admin'), updateNews);
router.delete('/:id', authenticate, authorize('admin'), deleteNews);

export default router;
