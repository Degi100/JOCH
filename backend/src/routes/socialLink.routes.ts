import { Router } from 'express';
import {
  getAllSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
} from '../controllers/socialLink.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.get('/', getAllSocialLinks);
router.get('/:id', getSocialLinkById);

// Protected routes (Admin/Member only)
router.post('/', authenticate, authorize('admin', 'member'), createSocialLink);
router.put('/:id', authenticate, authorize('admin', 'member'), updateSocialLink);
router.delete('/:id', authenticate, authorize('admin', 'member'), deleteSocialLink);
router.patch('/reorder', authenticate, authorize('admin', 'member'), reorderSocialLinks);

export default router;
