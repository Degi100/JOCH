// ============================================
// JOCH Bandpage - Guestbook Entry Type
// ============================================

/**
 * Guestbook Entry
 * Fan messages/entries in the guestbook
 */
export interface GuestbookEntry {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Guestbook Entry DTO
 * (without _id, timestamps)
 */
export interface CreateGuestbookEntryDto {
  name: string;
  email: string;
  message: string;
}
