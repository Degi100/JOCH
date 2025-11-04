import { Router } from 'express';
import {
  getAllContactMessages,
  getContactMessageById,
  createContactMessage,
  markMessageAsRead,
  deleteContactMessage,
} from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public route - anyone can send a contact message
router.post('/', createContactMessage);

// Protected routes (Admin only)
router.get('/', authenticate, authorize('admin'), getAllContactMessages);
router.get('/:id', authenticate, authorize('admin'), getContactMessageById);
router.patch('/:id/read', authenticate, authorize('admin'), markMessageAsRead);
router.delete('/:id', authenticate, authorize('admin'), deleteContactMessage);

export default router;
