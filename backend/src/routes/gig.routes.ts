import { Router } from 'express';
import {
  getAllGigs,
  getUpcomingGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
} from '../controllers/gig.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.get('/', getAllGigs);
router.get('/upcoming', getUpcomingGigs);
router.get('/:id', getGigById);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('admin'), createGig);
router.put('/:id', authenticate, authorize('admin'), updateGig);
router.delete('/:id', authenticate, authorize('admin'), deleteGig);

export default router;
