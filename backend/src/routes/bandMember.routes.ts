import { Router } from 'express';
import {
  getAllBandMembers,
  getBandMemberById,
  createBandMember,
  updateBandMember,
  deleteBandMember,
} from '../controllers/bandMember.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.get('/', getAllBandMembers);
router.get('/:id', getBandMemberById);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('admin'), createBandMember);
router.put('/:id', authenticate, authorize('admin'), updateBandMember);
router.delete('/:id', authenticate, authorize('admin'), deleteBandMember);

export default router;
