// Base Types
export type ObjectId = string;

// User & Authentication
export interface User {
  _id: ObjectId;
  email: string;
  password: string;
  role: 'admin' | 'member';
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

// Band Member
export interface BandMember {
  _id: ObjectId;
  name: string;
  instrument: string;
  bio: string;
  image: string; // URL/path to image
  order: number; // für Sortierung (0=links, 1=mitte, 2=rechts)
  createdAt: Date;
  updatedAt: Date;
}

// News/Blog Post
export interface NewsPost {
  _id: ObjectId;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: ObjectId; // Reference to User
  published: boolean;
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
  address?: string;
  date: Date;
  time?: string;
  ticketLink?: string;
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
  duration: number; // in Sekunden
  audioFile: string; // URL/path to audio file
  coverArt?: string;
  releaseDate?: Date;
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
