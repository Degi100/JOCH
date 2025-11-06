import { z } from 'zod';

// User Validation
export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});

export const createUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(100).optional(),
  role: z.enum(['admin', 'member', 'user']).default('user'),
});

// Band Member Validation
export const createBandMemberSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(100),
  instrument: z.string().min(2, 'Instrument muss angegeben werden').max(100),
  bio: z.string().min(10, 'Bio muss mindestens 10 Zeichen lang sein').max(1000),
  image: z.string().url('Ungültige Bild-URL'),
  order: z.number().int().min(0).max(2),
});

export const updateBandMemberSchema = createBandMemberSchema.partial();

// News Post Validation
export const createNewsPostSchema = z.object({
  title: z.string().min(5, 'Titel muss mindestens 5 Zeichen lang sein').max(200),
  content: z.string().min(50, 'Inhalt muss mindestens 50 Zeichen lang sein'),
  excerpt: z.string().min(20, 'Auszug muss mindestens 20 Zeichen lang sein').max(300),
  coverImage: z.string().url('Ungültige Bild-URL').optional(),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
});

export const updateNewsPostSchema = createNewsPostSchema.partial();

// Gig Validation
export const createGigSchema = z.object({
  title: z.string().min(3, 'Titel muss mindestens 3 Zeichen lang sein').max(200),
  venue: z.string().min(2, 'Veranstaltungsort muss angegeben werden').max(200),
  location: z.string().min(2, 'Stadt muss angegeben werden').max(200),
  address: z.string().max(300).optional(),
  date: z.string().datetime('Ungültiges Datum'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ungültige Zeit (Format: HH:MM)').optional(),
  ticketLink: z.string().url('Ungültiger Ticket-Link').optional(),
  price: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url('Ungültige Bild-URL').optional(),
  status: z.enum(['upcoming', 'past', 'cancelled']).default('upcoming'),
});

export const updateGigSchema = createGigSchema.partial();

// Song Validation
export const createSongSchema = z.object({
  title: z.string().min(1, 'Titel muss angegeben werden').max(200),
  duration: z.number().int().positive('Duration muss positiv sein'),
  audioFile: z.string().min(1, 'Audio-Datei muss angegeben werden'),
  coverArt: z.string().url('Ungültige Cover-URL').optional(),
  releaseDate: z.string().datetime().optional(),
  order: z.number().int().min(0),
});

export const updateSongSchema = createSongSchema.partial();

// Gallery Image Validation
export const createGalleryImageSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url('Ungültige Bild-URL'),
  thumbnailUrl: z.string().url('Ungültige Thumbnail-URL').optional(),
  category: z.enum(['live', 'promo', 'backstage', 'other']).default('other'),
  order: z.number().int().min(0),
});

export const updateGalleryImageSchema = createGalleryImageSchema.partial();

// Contact Message Validation
export const createContactMessageSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(100),
  email: z.string().email('Ungültige E-Mail Adresse'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein').max(2000),
});

// Query Params Validation
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
});

export const gigFilterSchema = paginationSchema.extend({
  status: z.enum(['upcoming', 'past', 'cancelled']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const newsFilterSchema = paginationSchema.extend({
  published: z.string().transform((val) => val === 'true').optional(),
});

export const galleryFilterSchema = paginationSchema.extend({
  category: z.enum(['live', 'promo', 'backstage', 'other']).optional(),
});

// File Upload Validation
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(
    (val) =>
      val.startsWith('image/') ||
      val.startsWith('audio/') ||
      val === 'application/pdf',
    'Ungültiger Dateityp'
  ),
  size: z.number().max(10 * 1024 * 1024, 'Datei darf maximal 10MB groß sein'),
});

// Export all type inferences
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateBandMemberInput = z.infer<typeof createBandMemberSchema>;
export type UpdateBandMemberInput = z.infer<typeof updateBandMemberSchema>;
export type CreateNewsPostInput = z.infer<typeof createNewsPostSchema>;
export type UpdateNewsPostInput = z.infer<typeof updateNewsPostSchema>;
export type CreateGigInput = z.infer<typeof createGigSchema>;
export type UpdateGigInput = z.infer<typeof updateGigSchema>;
export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;
export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type GigFilterInput = z.infer<typeof gigFilterSchema>;
export type NewsFilterInput = z.infer<typeof newsFilterSchema>;
export type GalleryFilterInput = z.infer<typeof galleryFilterSchema>;
