# JOCH Bandpage - Projekt Timeline & Entwicklungsstrategie

**Stand:** 2025-11-04
**Entwicklungsstart:** TBD
**Geschätzte Dauer:** 6-8 Wochen (je nach Verfügbarkeit)

---

## Entwicklungsstrategie

### Warum Backend zuerst?

**✅ Backend-First Approach empfohlen:**

1. **API definiert die Datenstruktur**
   - Frontend braucht klare API-Contracts
   - Shared Types können parallel entwickelt werden
   - Backend kann isoliert getestet werden

2. **Früh deployen & testen**
   - MongoDB Atlas Setup einmalig
   - Backend auf Render.com deployen
   - API ist verfügbar sobald Frontend startet

3. **Frontend kann Mock-Daten nutzen**
   - Während Backend entwickelt wird
   - Später einfach auf echte API umstellen

4. **Parallele Entwicklung möglich**
   - Nach Backend-Grundstruktur
   - Ein Teil arbeitet an API-Endpoints
   - Anderer Teil startet Frontend

---

## Timeline Übersicht (8 Wochen)

```
Woche 1-2:  Setup & Backend Foundation
Woche 3-4:  Backend API & Frontend Start
Woche 5-6:  Frontend Development & Integration
Woche 7:    CMS/Admin & Polish
Woche 8:    Testing, Content, Launch
```

---

## Detaillierte Timeline

### **Woche 1: Foundation & Setup**
**Fokus:** Monorepo, Shared Types, Backend Grundstruktur

#### Tag 1-2: Projekt-Setup
```bash
✅ Aufgaben:
- Monorepo aufsetzen (npm workspaces)
- package.json Files für alle 3 Workspaces
- TypeScript Configs (tsconfig.json)
- Git Repository initialisieren (.gitignore)
- ESLint & Prettier Setup (optional)

📦 Deliverables:
- Lauffähiges Monorepo
- npm run dev startet Backend & Frontend (leer)
```

#### Tag 3-4: Shared Types & MongoDB
```bash
✅ Aufgaben:
- Shared Types definieren (Gig, News, Song, User, BandMember, Image)
- Validation Schemas (Zod)
- Constants definieren (API Routes, Instrumente, Status)
- MongoDB Atlas Account erstellen
- Database & User anlegen

📦 Deliverables:
- @joch/shared Package kompiliert
- MongoDB Connection String bereit
- Alle Types exportiert
```

#### Tag 5-7: Backend Grundstruktur
```bash
✅ Aufgaben:
- Express Server Setup
- MongoDB Connection (Mongoose)
- Folder Structure (models/, routes/, controllers/, middleware/)
- Error Handling Middleware
- CORS Setup
- Environment Variables (.env)
- Health-Check Endpoint (/api/health)

📦 Deliverables:
- Backend startet ohne Errors
- MongoDB verbunden
- Erste Route erreichbar
```

**Ende Woche 1:**
- ✅ Monorepo läuft
- ✅ Shared Types definiert
- ✅ Backend Grundstruktur steht
- ✅ MongoDB verbunden

---

### **Woche 2: Backend Models & Core API**
**Fokus:** Mongoose Models, CRUD API für Gigs/News

#### Tag 1-3: Mongoose Models
```bash
✅ Aufgaben:
- Gig Model + CRUD API
- NewsPost Model + CRUD API
- BandMember Model + CRUD API
- Validation Middleware
- Test mit Postman/Thunder Client

📦 Deliverables:
- GET /api/gigs
- POST /api/gigs (später mit Auth)
- GET /api/news
- POST /api/news
- Alle Models in DB getestet
```

#### Tag 4-5: Auth System Vorbereitung
```bash
✅ Aufgaben:
- User Model erstellen
- bcrypt für Passwort-Hashing
- JWT Token Generation
- Auth Middleware (später für Protected Routes)
- Seed Script für ersten Admin-User

📦 Deliverables:
- User kann angelegt werden
- JWT Token wird generiert
- Auth Middleware funktioniert
```

#### Tag 6-7: Song & Image Models
```bash
✅ Aufgaben:
- Song Model + CRUD API
- Image Model + CRUD API
- File Upload vorbereiten (Multer Setup)
- uploads/ Ordner Struktur

📦 Deliverables:
- Alle Models fertig
- Backend API komplett (ohne File Upload)
```

**Ende Woche 2:**
- ✅ Alle Mongoose Models fertig
- ✅ CRUD APIs für Gigs, News, Songs, Band
- ✅ Auth System vorbereitet
- ✅ Backend bereit für File Upload

---

### **Woche 3: File Upload & Frontend Start**
**Fokus:** Backend File Upload, Frontend Grundstruktur

#### Tag 1-3: File Upload (Backend)
```bash
✅ Aufgaben:
- Multer diskStorage konfigurieren
- Upload Endpoints:
  - POST /api/upload/audio (MP3)
  - POST /api/upload/image (JPG/PNG)
- File Validation (Type, Size)
- Static File Serving (express.static)
- Test Uploads mit Postman

📦 Deliverables:
- File Upload funktioniert
- Files in uploads/ gespeichert
- URLs in MongoDB gespeichert
- Files abrufbar via /uploads/...
```

#### Tag 4-5: Backend Deploy zu Render.com
```bash
✅ Aufgaben:
- Render.com Account erstellen
- Backend Repository pushen (Git)
- Render Service erstellen
- Environment Variables setzen
- Deploy testen
- MongoDB Atlas Whitelist (0.0.0.0/0)

📦 Deliverables:
- Backend live auf Render.com
- API erreichbar (z.B. https://joch-backend.onrender.com)
- Health Check funktioniert
```

#### Tag 6-7: Frontend Setup & SASS Struktur
```bash
✅ Aufgaben:
- Vite + React + TypeScript Setup
- SASS installieren & konfigurieren
- Folder Structure (pages/, components/, styles/)
- SASS Variables definieren (colors, spacing, breakpoints)
- Mixins erstellen (responsive, buttons)
- Global Styles (reset, typography)
- Test: Erste Komponente mit SASS

📦 Deliverables:
- Frontend läuft (npm run dev)
- SASS kompiliert
- Styles/abstracts/ fertig
```

**Ende Woche 3:**
- ✅ Backend File Upload funktioniert
- ✅ Backend deployed auf Render.com
- ✅ Frontend Grundstruktur steht
- ✅ SASS System aufgebaut

---

### **Woche 4: Frontend Core Pages (Public)**
**Fokus:** Layout, Navigation, Public Pages

#### Tag 1-2: Layout & Navigation
```bash
✅ Aufgaben:
- Header Component (Sticky Navigation)
- Footer Component
- Navigation Component (Desktop + Mobile Burger Menu)
- React Router Setup (Routes)
- Layout Wrapper
- Test: Navigation zwischen Seiten

📦 Deliverables:
- Header/Footer auf allen Seiten
- Navigation funktioniert
- Mobile Menu öffnet/schließt
```

#### Tag 3-7: Public Pages (Basic)
```bash
✅ Aufgaben:
- Home Page (Hero, News-Teaser, Gig-Teaser)
- Band Page (Story, Bandmitglieder-Foto mit Hover-Effekt)
- Live Page (Gig-Liste)
- Music Page (Song-Liste, Audio Player)
- News Page (News-Liste, Detail-View)
- Contact Page (Kontaktformular, Social Links)

📦 Deliverables:
- Alle 6 Public Pages existieren
- Basic Layout vorhanden
- Noch keine echten Daten (Mock-Daten)
```

**Ende Woche 4:**
- ✅ Frontend Layout komplett
- ✅ Alle Public Pages vorhanden
- ✅ Navigation funktioniert
- ⚠️ Noch Mock-Daten (keine API-Integration)

---

### **Woche 5: API Integration & Frontend Features**
**Fokus:** Fetch API Wrapper, Daten laden, Components

#### Tag 1-2: API Service Layer
```bash
✅ Aufgaben:
- Fetch API Wrapper schreiben (api.ts)
- Service Files:
  - gig.service.ts
  - news.service.ts
  - band.service.ts
  - song.service.ts
- Custom Hooks:
  - useGigs.ts
  - useNews.ts
  - useSongs.ts
- Error Handling
- Loading States

📦 Deliverables:
- API Calls funktionieren
- Daten werden geladen
- Loading Spinner bei Requests
```

#### Tag 3-5: Components & Features
```bash
✅ Aufgaben:
- GigCard Component
- NewsCard Component
- AudioPlayer Component (HTML5 Audio)
- BandPhoto Component (mit Hover/Rotation Effekt!)
- ImageGallery Component (Lightbox)
- Button Component
- LoadingSpinner Component

📦 Deliverables:
- Alle Components funktionieren
- Band-Foto Hover-Effekt läuft
- Audio Player spielt MP3s
```

#### Tag 6-7: Pages mit echten Daten
```bash
✅ Aufgaben:
- Home: Lädt echte News & Gigs
- Band: Zeigt Bandmitglieder (mit Foto-Effekt)
- Live: Lädt Gigs von API
- Music: Lädt Songs, Audio Player funktioniert
- News: Lädt Posts von API
- Responsive Design für alle Pages

📦 Deliverables:
- Alle Pages zeigen echte Daten
- Mobile optimiert
- Audio Player funktioniert
```

**Ende Woche 5:**
- ✅ API Integration komplett
- ✅ Alle Components fertig
- ✅ Band-Foto Hover-Effekt implementiert
- ✅ Audio Player funktioniert
- ✅ Public Website funktioniert

---

### **Woche 6: Admin/CMS Development**
**Fokus:** Admin-Login, Dashboard, Content Management

#### Tag 1-2: Auth & Protected Routes
```bash
✅ Aufgaben:
- Login Page
- AuthContext (React Context)
- JWT Token Storage (localStorage)
- Protected Routes (HOC oder React Router)
- Logout Funktion
- Auto-Logout bei 401

📦 Deliverables:
- Login funktioniert
- Token wird gespeichert
- Protected Routes nur mit Login erreichbar
```

#### Tag 3-4: Admin Dashboard & Gig Manager
```bash
✅ Aufgaben:
- Dashboard (Übersicht, Stats)
- Gig Manager:
  - Liste aller Gigs
  - Create Gig Form
  - Edit Gig Form
  - Delete Gig
- Form Validation (Frontend + Backend)

📦 Deliverables:
- Admin kann Gigs verwalten
- CRUD funktioniert
- Validation zeigt Fehler
```

#### Tag 5-7: News, Song, Image Manager
```bash
✅ Aufgaben:
- News Manager (CRUD)
- Song Manager (CRUD + MP3 Upload)
- Image Manager (CRUD + Image Upload)
- Band-Info Editor
- File Upload UI (Drag & Drop optional)

📦 Deliverables:
- Alle CMS-Features funktionieren
- Bandmitglieder können Content selbst pflegen
```

**Ende Woche 6:**
- ✅ Admin/CMS komplett
- ✅ Login funktioniert
- ✅ Alle CRUD-Features fertig
- ✅ File Upload funktioniert

---

### **Woche 7: Polish, Responsive, Performance**
**Fokus:** Design verfeinern, Mobile optimieren, Performance

#### Tag 1-3: Responsive Design finalisieren
```bash
✅ Aufgaben:
- Mobile: Alle Pages testen
- Tablet: Breakpoints anpassen
- Touch-Optimierung (Band-Foto Rotation)
- Burger Menu verbessern
- Footer responsive
- Forms mobile-friendly

📦 Deliverables:
- Website auf allen Devices perfekt
- Touch funktioniert gut
```

#### Tag 4-5: Performance & SEO
```bash
✅ Aufgaben:
- Bilder optimieren (WebP, Lazy Loading)
- Code Splitting (React.lazy)
- Meta Tags für alle Pages
- Open Graph Tags (Social Sharing)
- Sitemap.xml (optional)
- robots.txt
- Lighthouse Score optimieren (> 90)

📦 Deliverables:
- Website lädt schnell
- SEO-Basics vorhanden
- Social Sharing funktioniert
```

#### Tag 6-7: Final Polish
```bash
✅ Aufgaben:
- SASS Styles verfeinern (Animations, Hover-Effects)
- Error Pages (404, 500)
- Loading States überall
- Accessibility (ARIA Labels, Keyboard Navigation)
- Browser Testing (Chrome, Firefox, Safari)
- Admin UI verbessern

📦 Deliverables:
- Website sieht professionell aus
- Alle Edge Cases handled
```

**Ende Woche 7:**
- ✅ Website responsive
- ✅ Performance optimiert
- ✅ SEO Basics fertig
- ✅ Design polished

---

### **Woche 8: Testing, Content, Deploy & Launch**
**Fokus:** Testing, Content befüllen, Final Deploy

#### Tag 1-2: Testing
```bash
✅ Aufgaben:
- Manuelle Tests:
  - Alle User Journeys durchspielen
  - Alle Forms testen
  - File Uploads testen
  - Mobile Testing (echte Geräte)
- Bug-Fixing
- Cross-Browser Testing

📦 Deliverables:
- Bug-Liste erstellt & gefixt
- Alle Features funktionieren
```

#### Tag 3-4: Content befüllen
```bash
✅ Aufgaben:
- Band-Story schreiben
- Bandmitglieder-Infos eintragen
- 3-5 Songs hochladen (mit Lyrics!)
- Alle Gigs eintragen (upcoming + past)
- 5-10 News-Posts schreiben
- Live-Fotos hochladen (Galerie)
- Band-Fotos hochladen
- Social Media Links eintragen

📦 Deliverables:
- Website mit echtem Content gefüllt
- Mindestens 3 Songs online
- Alle Gigs sichtbar
```

#### Tag 5-6: Frontend Deploy zu Vercel
```bash
✅ Aufgaben:
- Vercel Account erstellen
- Frontend Repository pushen
- Vercel Projekt erstellen
- Environment Variables setzen (API_URL)
- Custom Domain verbinden (optional)
- Deploy testen

📦 Deliverables:
- Frontend live auf Vercel
- Website erreichbar
- API-Calls funktionieren
```

#### Tag 7: Launch! 🚀
```bash
✅ Aufgaben:
- Final Check (alle Links, Forms, Features)
- Impressum & Datenschutz (DSGVO!)
- Social Media Announcement
- Website-Link in Social Media Bios
- Google Search Console einreichen
- Launch Party! 🎉

📦 Deliverables:
- Website ist LIVE
- Social Media geteilt
- Band kann Website nutzen
```

**Ende Woche 8:**
- ✅ Website LIVE
- ✅ Content vollständig
- ✅ Social Media Announcement
- ✅ Band nutzt CMS

---

## Parallelisierung (Wenn mehrere Entwickler)

### Woche 3-4: Parallel Development möglich

**Person A: Backend**
```
- File Upload
- Protected Routes
- Deploy zu Render.com
```

**Person B: Frontend**
```
- Frontend Setup
- SASS Struktur
- Layout Components
- Public Pages (mit Mock-Daten)
```

### Woche 5-6: Parallel Development

**Person A: API Integration**
```
- Fetch API Wrapper
- Service Layer
- Custom Hooks
```

**Person B: Components & Admin**
```
- UI Components
- Admin Pages
- Forms
```

---

## Kritischer Pfad (Was muss zuerst fertig sein?)

```
1. Monorepo Setup
   ↓
2. Shared Types
   ↓
3. Backend Grundstruktur + Models
   ↓
4. Backend Deploy (optional früh)
   ↓
5. Frontend Setup + SASS
   ↓
6. API Integration
   ↓
7. Admin/CMS
   ↓
8. Testing + Content + Launch
```

---

## Risiken & Puffer

### Potenzielle Zeitfresser:
1. **MongoDB Atlas Setup** (0.5 Tag)
   - Puffer: Account früh erstellen

2. **Render.com Deploy Issues** (0.5 Tag)
   - Puffer: Dokumentation lesen, Community fragen

3. **CORS Probleme** (0.5 Tag)
   - Puffer: CORS früh konfigurieren

4. **File Upload Debugging** (1 Tag)
   - Puffer: Multer Doku lesen, lokal testen

5. **Responsive Design Finetuning** (1-2 Tage)
   - Puffer: Woche 7 komplett dafür reserviert

6. **Content Creation** (1-2 Tage)
   - Puffer: Band kann parallel Content vorbereiten

### Puffer-Strategie:
- **Woche 7** = Polish-Woche (flexibel)
- **Woche 8 Tag 1-2** = Testing-Puffer

---

## Meilensteine & Checkpoints

### Meilenstein 1: Backend Foundation (Ende Woche 2)
✅ Backend deployed, alle Models fertig, API erreichbar

### Meilenstein 2: Frontend Basic (Ende Woche 4)
✅ Alle Public Pages vorhanden, Navigation funktioniert

### Meilenstein 3: Full Integration (Ende Woche 5)
✅ Website zeigt echte Daten, alle Features funktionieren

### Meilenstein 4: CMS Complete (Ende Woche 6)
✅ Band kann Content selbst pflegen

### Meilenstein 5: Launch Ready (Ende Woche 7)
✅ Website polished, responsive, performant

### Meilenstein 6: LIVE (Ende Woche 8)
✅ Website online, Content vollständig, Social Media Announcement

---

## Empfohlene Arbeitsweise

### Daily Routine (wenn Vollzeit):
```
Morning:
- Standup (5min): Was heute? Blocker?
- Deep Work (3-4h): Coding

Afternoon:
- Testing (1h): Features testen
- Deep Work (2-3h): Coding
- Review (30min): Code/Design Review

Evening:
- Commit & Push
- Todo für morgen notieren
```

### Part-Time (z.B. Abends/Wochenende):
```
- Timeline x2: 16 Wochen statt 8
- Pro Woche 15-20h investieren
- Wochenende für Deep Work nutzen
- Abends kleinere Tasks
```

---

## Post-Launch Roadmap (nach Woche 8)

### Woche 9-10: Feedback & Iteration
```
- User Feedback sammeln
- Analytics auswerten
- Bugs fixen
- Performance weiter optimieren
```

### Woche 11-12: Features Phase 2
```
- Video Player (YouTube Embeds)
- Newsletter System
- Merch Shop (optional)
```

### Woche 13+: Migration zu Hostinger
```
- VPS bei Hostinger bestellen
- Node.js + MongoDB auf VPS
- Migration planen & durchführen
- DNS umstellen
```

---

## Zusammenfassung

**Empfohlene Strategie:**
1. **Backend zuerst** (Woche 1-3)
2. **Frontend parallel ab Woche 3**
3. **Integration Woche 5**
4. **Admin Woche 6**
5. **Polish Woche 7**
6. **Launch Woche 8**

**Kritisch:**
- Shared Types früh definieren
- Backend vor Frontend starten
- Früh deployen (Render.com Woche 3)
- Puffer einplanen (Woche 7)

**Realistisch:**
- 8 Wochen bei Vollzeit (40h/Woche)
- 16 Wochen bei Part-Time (20h/Woche)
- Mit Puffer: +1-2 Wochen

**Nächster Schritt:**
→ Woche 1, Tag 1 starten: Monorepo Setup! 🚀

---

**Stand:** 2025-11-04
**Status:** Timeline definiert, bereit für Start
