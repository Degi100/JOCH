// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  BAND_MEMBERS: {
    BASE: '/band-members',
    BY_ID: (id: string) => `/band-members/${id}`,
  },
  NEWS: {
    BASE: '/news',
    BY_ID: (id: string) => `/news/${id}`,
    PUBLISHED: '/news/published',
  },
  GIGS: {
    BASE: '/gigs',
    BY_ID: (id: string) => `/gigs/${id}`,
    UPCOMING: '/gigs/upcoming',
    PAST: '/gigs/past',
  },
  SONGS: {
    BASE: '/songs',
    BY_ID: (id: string) => `/songs/${id}`,
  },
  GALLERY: {
    BASE: '/gallery',
    BY_ID: (id: string) => `/gallery/${id}`,
    BY_CATEGORY: (category: string) => `/gallery/category/${category}`,
  },
  CONTACT: {
    BASE: '/contact',
    BY_ID: (id: string) => `/contact/${id}`,
    MARK_READ: (id: string) => `/contact/${id}/read`,
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    AUDIO: '/upload/audio',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Ungültige E-Mail oder Passwort',
  UNAUTHORIZED: 'Nicht autorisiert',
  TOKEN_EXPIRED: 'Token ist abgelaufen',
  TOKEN_INVALID: 'Ungültiger Token',
  USER_EXISTS: 'Benutzer existiert bereits',
  USER_NOT_FOUND: 'Benutzer nicht gefunden',

  // General
  NOT_FOUND: 'Ressource nicht gefunden',
  VALIDATION_ERROR: 'Validierungsfehler',
  SERVER_ERROR: 'Interner Serverfehler',
  BAD_REQUEST: 'Ungültige Anfrage',

  // File Upload
  FILE_TOO_LARGE: 'Datei ist zu groß',
  INVALID_FILE_TYPE: 'Ungültiger Dateityp',
  UPLOAD_FAILED: 'Upload fehlgeschlagen',

  // Resources
  BAND_MEMBER_NOT_FOUND: 'Bandmitglied nicht gefunden',
  NEWS_POST_NOT_FOUND: 'News-Beitrag nicht gefunden',
  GIG_NOT_FOUND: 'Gig nicht gefunden',
  SONG_NOT_FOUND: 'Song nicht gefunden',
  IMAGE_NOT_FOUND: 'Bild nicht gefunden',
  MESSAGE_NOT_FOUND: 'Nachricht nicht gefunden',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Erfolgreich eingeloggt',
  LOGOUT_SUCCESS: 'Erfolgreich ausgeloggt',
  REGISTER_SUCCESS: 'Registrierung erfolgreich',

  // CRUD
  CREATED: 'Erfolgreich erstellt',
  UPDATED: 'Erfolgreich aktualisiert',
  DELETED: 'Erfolgreich gelöscht',

  // Contact
  MESSAGE_SENT: 'Nachricht erfolgreich gesendet',
  MESSAGE_READ: 'Nachricht als gelesen markiert',

  // Upload
  UPLOAD_SUCCESS: 'Upload erfolgreich',
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  },
  AUDIO: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  FULL: 'DD.MM.YYYY HH:mm',
  DATE_ONLY: 'DD.MM.YYYY',
  TIME_ONLY: 'HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

// Gig Status
export const GIG_STATUS = {
  UPCOMING: 'upcoming',
  PAST: 'past',
  CANCELLED: 'cancelled',
} as const;

// Gallery Categories
export const GALLERY_CATEGORIES = {
  LIVE: 'live',
  PROMO: 'promo',
  BACKSTAGE: 'backstage',
  OTHER: 'other',
} as const;

// Band Info (für Footer etc.)
export const BAND_INFO = {
  NAME: 'JOCH',
  GENRE: 'Deutschrock mit Metal',
  LOCATION: 'Bremen-Nord',
  FOUNDED: 2022,
  MEMBER_COUNT: 3,
} as const;
