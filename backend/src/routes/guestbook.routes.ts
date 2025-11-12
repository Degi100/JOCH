// ============================================
// JOCH Bandpage - Guestbook Routes
// ============================================

import { Router } from 'express';
import * as guestbookController from '../controllers/guestbook.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Public Routes
 */

// GET /api/guestbook - Get all entries (without emails)
router.get('/', guestbookController.getAllEntries);

// POST /api/guestbook - Create new entry
router.post('/', guestbookController.createEntry);

/**
 * Protected Routes (Admin/Member)
 */

// GET /api/guestbook/admin - Get all entries (with emails, for admin)
router.get(
  '/admin',
  authenticate,
  authorize('admin', 'member'),
  guestbookController.getAllEntriesAdmin
);

// DELETE /api/guestbook/:id - Delete entry
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'member'),
  guestbookController.deleteEntry
);

export default router;
