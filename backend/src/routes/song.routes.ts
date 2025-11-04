import { Router } from 'express';
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
} from '../controllers/song.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.get('/', getAllSongs);
router.get('/:id', getSongById);

// Protected routes (Admin/Member only)
router.post('/', authenticate, authorize('admin', 'member'), createSong);
router.put('/:id', authenticate, authorize('admin', 'member'), updateSong);
router.delete('/:id', authenticate, authorize('admin', 'member'), deleteSong);

export default router;
