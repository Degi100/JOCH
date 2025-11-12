// Base Types
export type ObjectId = string;

// User & Authentication
export interface User {
  _id: ObjectId;
  email: string;
  password: string;
  name?: string;
  role: 'admin' | 'member' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Band Member
export interface BandMember {
  _id: ObjectId;
  name: string;
  role?: string; // z.B. "Lead Vocals", "Gitarre"
  instrument: string;
  bio: string;
  image: string; // URL/path to image
  photo?: string; // Alias für image (backward compatibility)
  instagram?: string;
  facebook?: string;
  twitter?: string;
  order: number; // für Sortierung (0=links, 1=mitte, 2=rechts)
  createdAt: Date;
  updatedAt: Date;
}

// News/Blog Post
export interface NewsPost {
  _id: ObjectId;
  title: string;
  slug?: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  featuredImage?: string; // Alias für coverImage
  author: ObjectId | User; // Reference to User (can be populated)
  published: boolean;
  status?: 'draft' | 'published'; // Alias für published
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Gig/Concert
export interface Gig {
  _id: ObjectId;
  title: string;
  venue: string;
  location: string; // Stadt
  city?: string; // Alias für location
  country?: string;
  address?: string;
  date: Date;
  time?: string;
  ticketLink?: string;
  ticketUrl?: string; // Alias für ticketLink
  price?: string;
  description?: string;
  image?: string;
  status: 'upcoming' | 'past' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Song
export interface Song {
  _id: ObjectId;
  title: string;
  artist?: string;
  album?: string;
  lyrics?: string;
  duration: number; // in Sekunden
  audioFile: string; // URL/path to audio file
  audioUrl?: string; // Alias für audioFile
  coverArt?: string;
  releaseDate?: Date;
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    soundcloud?: string;
  };
  order: number; // für Playlist-Sortierung
  createdAt: Date;
  updatedAt: Date;
}

// Image/Gallery
export interface GalleryImage {
  _id: ObjectId;
  title?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: 'live' | 'promo' | 'backstage' | 'other';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Form
export interface ContactMessage {
  _id: ObjectId;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Guestbook Entry
export interface GuestbookEntry {
  _id: ObjectId;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGuestbookEntryDto {
  name: string;
  email: string;
  message: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Specific List Response Types
export interface GigListResponse {
  gigs: Gig[];
  total: number;
}

export interface NewsListResponse {
  posts: NewsPost[];
  total: number;
}

export interface SongListResponse {
  songs: Song[];
  total: number;
}

// File Upload
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}
