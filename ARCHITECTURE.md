# JOCH Bandpage - System Architektur

## Übersicht der Kommunikation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INTERNET / USERS                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                    ┌─────────────────────────────────┐
                    │         DOMAIN (DNS)            │
                    │     www.joch-band.de            │
                    │                                 │
                    │  Routes traffic to:             │
                    │  • Frontend (Vercel)            │
                    │  • Backend API (Render.com)     │
                    └─────────────────────────────────┘
                              │         │
                 ┌────────────┘         └────────────┐
                 │                                   │
                 ▼                                   ▼
    ┏━━━━━━━━━━━━━━━━━━━━━┓           ┏━━━━━━━━━━━━━━━━━━━━━┓
    ┃      FRONTEND       ┃           ┃      BACKEND        ┃
    ┃   (React + Vite)    ┃   API     ┃   (Express + TS)    ┃
    ┃                     ┃  Calls    ┃                     ┃
    ┃  Hosted on:         ┃◄─────────►┃  Hosted on:         ┃
    ┃  Vercel (Free)      ┃  HTTPS    ┃  Render.com (Free)  ┃
    ┃                     ┃           ┃                     ┃
    ┗━━━━━━━━━━━━━━━━━━━━━┛           ┗━━━━━━━━━━━━━━━━━━━━━┛
            │                                     │
            │                                     │
            │                                     │ MongoDB
            │                                     │ Driver
            │                                     │
            ▼                                     ▼
    ┌───────────────────┐           ┌───────────────────────────┐
    │   Static Assets   │           │   DATABASE                │
    │   • HTML          │           │   (MongoDB)               │
    │   • CSS/SASS      │           │                           │
    │   • JS Bundle     │           │   Hosted on:              │
    │   • Images        │           │   MongoDB Atlas (512MB)   │
    │   • Fonts         │           │                           │
    └───────────────────┘           │   Collections:            │
                                    │   • users                 │
                                    │   • bandmembers           │
                                    │   • newsposts             │
                                    │   • gigs                  │
                                    │   • songs                 │
                                    │   • galleryimages         │
                                    │   • contactmessages       │
                                    └───────────────────────────┘
```

---

## Detaillierte Request-Flow Beispiele

### 1. Besucher lädt die Homepage

```
┌─────────┐      1. GET joch-band.de      ┌──────────┐
│ Browser │──────────────────────────────►│   DNS    │
└─────────┘                                └──────────┘
     │                                          │
     │              2. IP: Vercel               │
     │◄─────────────────────────────────────────┘
     │
     │    3. GET / (HTML/CSS/JS)
     ├──────────────────────────────────►┌───────────┐
     │                                    │  Vercel   │
     │    4. Static Files (React Build)   │ (Frontend)│
     │◄───────────────────────────────────┤           │
     │                                    └───────────┘
     │
     │    5. GET /api/news (fetch latest news)
     ├───────────────────────────────────────────────►┌────────────┐
     │                                                 │ Render.com │
     │                                                 │ (Backend)  │
     │                                                 └────────────┘
     │                                                       │
     │                                    6. Query News      │
     │                                                       ▼
     │                                                 ┌──────────┐
     │                                                 │ MongoDB  │
     │                                                 │  Atlas   │
     │                                                 └──────────┘
     │                                                       │
     │    7. JSON Response (News Data)                      │
     │◄──────────────────────────────────────────────────────┘
     │
     │    8. Render News in React
     └──► [Page displays with news]
```

---

### 2. Admin loggt sich ein und erstellt einen Gig

```
┌─────────┐                           ┌────────────┐                    ┌──────────┐
│ Browser │                           │ Render.com │                    │ MongoDB  │
│ (Admin) │                           │ (Backend)  │                    │  Atlas   │
└─────────┘                           └────────────┘                    └──────────┘
     │                                       │                                │
     │  1. POST /api/auth/login              │                                │
     │  { email, password }                  │                                │
     ├──────────────────────────────────────►│                                │
     │                                       │  2. Find user + verify pwd     │
     │                                       ├───────────────────────────────►│
     │                                       │  3. User data                  │
     │                                       │◄───────────────────────────────┤
     │  4. { token: "JWT...", user }         │                                │
     │◄──────────────────────────────────────┤                                │
     │                                       │                                │
     │  5. Store token in localStorage       │                                │
     │  Navigate to /admin/gigs              │                                │
     │                                       │                                │
     │  6. POST /api/gigs                    │                                │
     │  Headers: { Authorization: "Bearer ..." }                              │
     │  Body: { date, venue, city, ... }     │                                │
     ├──────────────────────────────────────►│                                │
     │                                       │  7. Verify JWT                 │
     │                                       │  8. Validate gig data          │
     │                                       │  9. Create Gig document        │
     │                                       ├───────────────────────────────►│
     │                                       │ 10. Created gig                │
     │                                       │◄───────────────────────────────┤
     │ 11. { success, gig }                  │                                │
     │◄──────────────────────────────────────┤                                │
     │                                       │                                │
     │ 12. Update UI with new gig            │                                │
     └──► [Gig appears in list]              │                                │
```

---

### 3. File Upload (Song MP3 oder Bild)

```
┌─────────┐                           ┌────────────┐                    ┌──────────┐
│ Browser │                           │ Render.com │                    │  Server  │
│ (Admin) │                           │ (Backend)  │                    │  Disk    │
└─────────┘                           └────────────┘                    └──────────┘
     │                                       │                                │
     │  1. POST /api/upload/song             │                                │
     │  Content-Type: multipart/form-data    │                                │
     │  [File Blob: song.mp3, 5MB]           │                                │
     ├──────────────────────────────────────►│                                │
     │                                       │  2. Multer Middleware          │
     │                                       │  • Check auth (JWT)            │
     │                                       │  • Validate file type          │
     │                                       │  • Check file size             │
     │                                       │                                │
     │                                       │  3. Save to disk               │
     │                                       ├───────────────────────────────►│
     │                                       │     uploads/audio/             │
     │                                       │     song-1234567890.mp3        │
     │                                       │                                │
     │                                       │  4. File saved ✓               │
     │                                       │◄───────────────────────────────┤
     │                                       │                                │
     │  5. { url: "/uploads/audio/..." }     │                                │
     │◄──────────────────────────────────────┤                                │
     │                                       │                                │
     │  6. POST /api/songs                   │                                │
     │  { title, artist, audioUrl, ... }     │                                │
     ├──────────────────────────────────────►│──────────────────────────┐
     │                                       │  Save to MongoDB          │
     │  7. { success, song }                 │                           ▼
     │◄──────────────────────────────────────┤                    ┌──────────┐
     │                                       │                    │ MongoDB  │
     │                                       │                    │  Atlas   │
     └──► [Song appears in Music page]       │                    └──────────┘
                                             │
                     File stored on:         │  Metadata stored in:
                     Render.com Disk         │  MongoDB Atlas
                     (uploads/ folder)       │  (songs collection)
```

---

## Komponenten-Details

### Frontend (React + Vite)
```
┌──────────────────────────────────────────┐
│           FRONTEND LAYERS                │
├──────────────────────────────────────────┤
│  1. Pages (Routes)                       │
│     • Home.tsx                           │
│     • Band.tsx                           │
│     • Live.tsx                           │
│     • Music.tsx                          │
│     • News.tsx                           │
│     • Contact.tsx                        │
│     • Admin/* (Protected Routes)         │
├──────────────────────────────────────────┤
│  2. Components                           │
│     • Header, Footer, Navigation         │
│     • GigCard, NewsCard, SongPlayer      │
│     • Form Components                    │
├──────────────────────────────────────────┤
│  3. Services (API Calls)                 │
│     • auth.service.ts                    │
│     • gig.service.ts                     │
│     • news.service.ts                    │
│     • song.service.ts                    │
│     • upload.service.ts                  │
├──────────────────────────────────────────┤
│  4. Context (State Management)           │
│     • AuthContext (JWT, User)            │
├──────────────────────────────────────────┤
│  5. Styles (SASS)                        │
│     • abstracts/ (vars, mixins)          │
│     • base/ (reset, typography)          │
│     • *.module.scss (per component)      │
└──────────────────────────────────────────┘
```

### Backend (Express + TypeScript)
```
┌──────────────────────────────────────────┐
│           BACKEND LAYERS                 │
├──────────────────────────────────────────┤
│  1. Routes (API Endpoints)               │
│     • /api/auth/login                    │
│     • /api/auth/register                 │
│     • /api/gigs (CRUD)                   │
│     • /api/news (CRUD)                   │
│     • /api/songs (CRUD)                  │
│     • /api/upload                        │
├──────────────────────────────────────────┤
│  2. Middleware                           │
│     • auth.middleware (JWT verify)       │
│     • validate.middleware (Zod)          │
│     • upload.middleware (Multer)         │
│     • error.middleware                   │
├──────────────────────────────────────────┤
│  3. Controllers (Business Logic)         │
│     • auth.controller.ts                 │
│     • gig.controller.ts                  │
│     • news.controller.ts                 │
│     • song.controller.ts                 │
│     • upload.controller.ts               │
├──────────────────────────────────────────┤
│  4. Services (Reusable Logic)            │
│     • auth.service.ts (JWT)              │
│     • upload.service.ts                  │
├──────────────────────────────────────────┤
│  5. Models (Mongoose Schemas)            │
│     • User.model.ts                      │
│     • BandMember.model.ts                │
│     • NewsPost.model.ts                  │
│     • Gig.model.ts                       │
│     • Song.model.ts                      │
│     • GalleryImage.model.ts              │
│     • ContactMessage.model.ts            │
├──────────────────────────────────────────┤
│  6. Config                               │
│     • database.ts (MongoDB connection)   │
│     • .env (secrets)                     │
└──────────────────────────────────────────┘
```

### Shared Package
```
┌──────────────────────────────────────────┐
│        SHARED (Frontend + Backend)       │
├──────────────────────────────────────────┤
│  1. Types (TypeScript Interfaces)        │
│     • User.ts, Gig.ts, NewsPost.ts       │
│     • Song.ts, BandMember.ts, etc.       │
├──────────────────────────────────────────┤
│  2. Validation (Zod Schemas)             │
│     • gig.validation.ts                  │
│     • news.validation.ts                 │
│     • auth.validation.ts                 │
├──────────────────────────────────────────┤
│  3. Constants                            │
│     • api-routes.ts                      │
│     • instruments.ts                     │
│     • gig-status.enum.ts                 │
├──────────────────────────────────────────┤
│  4. Utils                                │
│     • date.utils.ts                      │
│     • string.utils.ts                    │
└──────────────────────────────────────────┘
```

---

## Deployment & Hosting

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│      VERCEL         │     │    RENDER.COM       │     │   MONGODB ATLAS     │
│   (Frontend Host)   │     │   (Backend Host)    │     │   (Database Host)   │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│  • Static Files     │     │  • Node.js Runtime  │     │  • 512MB Free Tier  │
│  • CDN Distribution │     │  • Express Server   │     │  • Shared Cluster   │
│  • Auto SSL         │     │  • 750h/month free  │     │  • Auto Backups     │
│  • Git Deploy       │     │  • Auto Deploy      │     │  • Cloud Security   │
│                     │     │  • uploads/ folder  │     │                     │
│  Free Tier:         │     │                     │     │  Free Tier:         │
│  ✓ Unlimited        │     │  Free Tier:         │     │  ✓ 512MB Storage    │
│  ✓ 100GB Bandwidth  │     │  ✓ 750 hours        │     │  ✓ Shared CPU       │
│  ✓ Custom Domain    │     │  ✓ 512MB RAM        │     │  ✓ 3 Users          │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                            │                            │
         └────────────────────────────┴────────────────────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   joch-band.de (Domain) │
                         │   • Frontend: /         │
                         │   • Backend: /api/*     │
                         └─────────────────────────┘
```

---

## Später: Migration zu Hostinger VPS

```
┌───────────────────────────────────────────────────────────────────┐
│              HOSTINGER VPS (One Server, All Services)             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│   │   Nginx     │      │   Node.js   │      │  MongoDB    │     │
│   │ (Reverse    │─────►│   (Express  │─────►│  (Local DB) │     │
│   │  Proxy)     │      │    Server)  │      │             │     │
│   └─────────────┘      └─────────────┘      └─────────────┘     │
│         │                     │                     │            │
│         │                     │                     │            │
│   Static Files          Backend API           Database           │
│   /var/www/html/        /var/www/api/        /var/lib/mongodb/   │
│                                                                   │
│   ✓ Full Control        ✓ No Sleep Mode      ✓ More Storage      │
│   ✓ Better Performance  ✓ Custom Config      ✓ Local Backups     │
│   ✓ One Server          ✓ PM2 Process Mgmt   ✓ Or keep Atlas     │
│                                                                   │
│   Cost: ~4-8€/month     OS: Ubuntu 22.04 LTS                     │
└───────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   joch-band.de (Domain)   │
                    │   Points to VPS IP        │
                    └───────────────────────────┘
```

---

## Security & Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        JWT AUTHENTICATION                             │
└──────────────────────────────────────────────────────────────────────┘

1. LOGIN
┌─────────┐                    ┌────────────┐                ┌──────────┐
│ Browser │                    │  Backend   │                │ MongoDB  │
└─────────┘                    └────────────┘                └──────────┘
     │                                │                            │
     │  POST /api/auth/login          │                            │
     │  { email, password }           │                            │
     ├───────────────────────────────►│                            │
     │                                │  Find user by email        │
     │                                ├───────────────────────────►│
     │                                │  User document             │
     │                                │◄───────────────────────────┤
     │                                │                            │
     │                                │  Compare passwords         │
     │                                │  (bcrypt.compare)          │
     │                                │                            │
     │                                │  Generate JWT              │
     │                                │  jwt.sign({                │
     │                                │    userId,                 │
     │                                │    email,                  │
     │                                │    role                    │
     │                                │  }, SECRET, { exp: 7d })   │
     │                                │                            │
     │  { token: "eyJhbG...",         │                            │
     │    user: { ... } }             │                            │
     │◄───────────────────────────────┤                            │
     │                                │                            │
     │  Store in localStorage         │                            │
     │  localStorage.setItem(         │                            │
     │    'token', token              │                            │
     │  )                             │                            │
     │                                │                            │

2. PROTECTED REQUEST
     │                                │                            │
     │  GET /api/gigs                 │                            │
     │  Headers: {                    │                            │
     │    Authorization:              │                            │
     │    "Bearer eyJhbG..."          │                            │
     │  }                             │                            │
     ├───────────────────────────────►│                            │
     │                                │                            │
     │                                │  auth.middleware()         │
     │                                │  • Extract token           │
     │                                │  • Verify signature        │
     │                                │  • Check expiration        │
     │                                │  • Decode payload          │
     │                                │                            │
     │                                │  ✓ Valid → Continue        │
     │                                │  ✗ Invalid → 401 Error     │
     │                                │                            │
     │                                │  Query gigs                │
     │                                ├───────────────────────────►│
     │                                │  Gigs array                │
     │                                │◄───────────────────────────┤
     │  { gigs: [...] }               │                            │
     │◄───────────────────────────────┤                            │
     │                                │                            │
```

---

## Data Flow Beispiel: Gig erstellen bis Homepage-Anzeige

```
┌────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE GIG LIFECYCLE                              │
└────────────────────────────────────────────────────────────────────────┘

Step 1: Admin erstellt Gig
┌─────────────────┐
│ Admin Interface │
│ /admin/gigs     │
└────────┬────────┘
         │
         │  Form: { date: "2025-12-31", venue: "Schlachthof",
         │          city: "Bremen", ticketLink: "..." }
         │
         ▼
┌─────────────────┐     POST /api/gigs      ┌─────────────────┐
│   Frontend      │────────────────────────►│   Backend       │
│   Service       │    + JWT in Headers     │   Controller    │
└─────────────────┘                         └────────┬────────┘
                                                     │
                                                     │  Validate (Zod)
                                                     │  Check Auth (JWT)
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │   Gig.model     │
                                            │   .create()     │
                                            └────────┬────────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │   MongoDB       │
                                            │   gigs          │
                                            │   collection    │
                                            └─────────────────┘

Step 2: Homepage lädt Gigs
┌─────────────────┐
│   Homepage      │
│   (useEffect)   │
└────────┬────────┘
         │
         │  useGigs() hook calls gigService.getUpcoming()
         │
         ▼
┌─────────────────┐     GET /api/gigs       ┌─────────────────┐
│   Frontend      │────────────────────────►│   Backend       │
│   Service       │    ?status=upcoming     │   Controller    │
└─────────────────┘                         └────────┬────────┘
                                                     │
                                                     │  Query:
                                                     │  Gig.find({
                                                     │    status: 'upcoming',
                                                     │    date: { $gte: now }
                                                     │  })
                                                     │  .sort({ date: 1 })
                                                     │  .limit(3)
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │   MongoDB       │
                                            │   Returns 3     │
                                            │   upcoming gigs │
                                            └────────┬────────┘
                                                     │
                                                     │  [
                                                     │    { date: "2025-12-31", ... },
                                                     │    { date: "2026-01-15", ... },
                                                     │    { date: "2026-02-20", ... }
                                                     │  ]
                                                     │
         ┌───────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   GigCard       │───┐
│   Component     │   │
└─────────────────┘   │  Render 3x
┌─────────────────┐   │
│   GigCard       │───┤
│   Component     │   │
└─────────────────┘   │
┌─────────────────┐   │
│   GigCard       │───┘
│   Component     │
└─────────────────┘
         │
         ▼
   User sieht Gigs auf Homepage
```

---

## Environment Variables (.env)

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/joch-band

# Auth
JWT_SECRET=super_secret_key_hier_ein_langer_random_string
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://joch-band.de

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads
```

### Frontend (.env)
```bash
# API Endpoint
VITE_API_URL=https://joch-backend.onrender.com/api

# App
VITE_APP_NAME=JOCH Bandpage
```

---

## Zusammenfassung: Warum 3 Services?

```
┌────────────────────────────────────────────────────────────────────┐
│  Vercel        = Statische Dateien hosten (HTML, CSS, JS)         │
│                  → React Build wird hier deployed                  │
│                  → Schnelles CDN, automatisches SSL                │
├────────────────────────────────────────────────────────────────────┤
│  Render.com    = Node.js Code ausführen (Express Server)          │
│                  → API Endpoints (CRUD, Auth, Upload)             │
│                  → Business Logic, Middleware                      │
│                  → File Storage (uploads/ folder)                  │
├────────────────────────────────────────────────────────────────────┤
│  MongoDB Atlas = Daten persistent speichern (Database)            │
│                  → Collections (users, gigs, news, etc.)          │
│                  → Queries, Indexes, Backups                       │
│                  → Keine Code-Ausführung, nur Datenspeicherung    │
└────────────────────────────────────────────────────────────────────┘

Alle 3 kommunizieren über HTTPS miteinander!
Frontend (Vercel) → Backend (Render.com) → Database (MongoDB Atlas)
```

---

**Stand:** 2025-11-07
**Status:** Complete Architecture Documentation ✅