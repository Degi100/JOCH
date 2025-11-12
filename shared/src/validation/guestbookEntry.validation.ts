// ============================================
// JOCH Bandpage - Guestbook Entry Validation
// ============================================

import { z } from 'zod';

/**
 * Create Guestbook Entry Schema
 */
export const createGuestbookEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),

  email: z
    .string()
    .trim()
    .email('Bitte eine gültige Email-Adresse eingeben')
    .max(255, 'Email darf maximal 255 Zeichen lang sein'),

  message: z
    .string()
    .trim()
    .min(10, 'Nachricht muss mindestens 10 Zeichen lang sein')
    .max(1000, 'Nachricht darf maximal 1000 Zeichen lang sein'),
});

export type CreateGuestbookEntryInput = z.infer<
  typeof createGuestbookEntrySchema
>;
