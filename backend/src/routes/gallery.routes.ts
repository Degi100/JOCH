import { Router } from 'express';
import {
  getAllGalleryImages,
  getGalleryImageById,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.get('/', getAllGalleryImages);
router.get('/:id', getGalleryImageById);

// Protected routes (Admin/Member only)
router.post('/', authenticate, authorize('admin', 'member'), createGalleryImage);
router.put('/:id', authenticate, authorize('admin', 'member'), updateGalleryImage);
router.delete('/:id', authenticate, authorize('admin', 'member'), deleteGalleryImage);

export default router;
