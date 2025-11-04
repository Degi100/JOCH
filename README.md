# JOCH Bandpage

Offizielle Website für JOCH - Deutschrock mit Metal aus Bremen-Nord.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + SASS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **Shared**: Gemeinsame TypeScript Types und Zod Validation Schemas

## Monorepo Struktur

```
JOCH/
├── frontend/          # React Frontend (Vite)
├── backend/           # Express API Server
├── shared/            # Gemeinsame Types & Validation
└── package.json       # Root workspace configuration
```

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

Dies installiert alle Dependencies für alle drei Workspaces (frontend, backend, shared).

### 2. Environment Variables

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Dann die MongoDB URI und JWT Secret eintragen
```

**Frontend** (`frontend/.env`):
```bash
cp frontend/.env.example frontend/.env
# API URL bei Bedarf anpassen
```

### 3. MongoDB Atlas Setup

1. Account erstellen auf [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Cluster erstellen (Free Tier M0)
3. Database User anlegen
4. IP Whitelist konfigurieren (0.0.0.0/0 für Development)
5. Connection String kopieren und in `backend/.env` eintragen

## Development

### Alle Services gleichzeitig starten

```bash
npm run dev
```

Dies startet:
- Frontend auf http://localhost:5173
- Backend auf http://localhost:5000

### Einzelne Services starten

**Frontend**:
```bash
npm run dev:frontend
```

**Backend**:
```bash
npm run dev:backend
```

**Shared** (Build nach Änderungen):
```bash
npm run build:shared
```

## Build

### Production Build für alle Workspaces

```bash
npm run build
```

### Einzelne Builds

```bash
npm run build:frontend
npm run build:backend
npm run build:shared
```

## Code-Prinzipien

- ✅ **Clean Code**: DRY, Single Responsibility, Separation of Concerns
- ✅ **Kein Monolith**: Klare Trennung von Frontend, Backend und Shared Code
- ✅ **CSS Modules + SASS**: Styling in separaten SCSS-Dateien, keine Inline-Styles
- ✅ **TypeScript**: Type-Safety über alle Workspaces
- ✅ **Shared Types**: Single Source of Truth für Datenstrukturen

## Workspace Scripts

Jeder Workspace hat eigene Scripts:

**Frontend** (`frontend/`):
- `npm run dev` - Vite Dev Server
- `npm run build` - TypeScript + Vite Production Build
- `npm run preview` - Preview Production Build
- `npm run lint` - ESLint

**Backend** (`backend/`):
- `npm run dev` - tsx watch mode (Hot Reload)
- `npm run build` - TypeScript Compilation
- `npm run start` - Production Server (benötigt Build)
- `npm run clean` - Löscht dist/ Ordner

**Shared** (`shared/`):
- `npm run build` - TypeScript Compilation + Declaration Files
- `npm run clean` - Löscht dist/ Ordner

## Deployment

### Jetzt (Free Tier)

- **Frontend**: Vercel
- **Backend**: Render.com
- **Database**: MongoDB Atlas (512MB Free)

### Später (Production)

- **Alles zusammen**: Hostinger VPS (einmalige Migration)

## Entwicklungs-Timeline

Siehe [projekt-timeline.md](projekt-timeline.md) für detaillierte 8-Wochen Roadmap.

## Dokumentation

- [Website Konzept](website-konzept.md) - Vollständiges UI/UX Konzept
- [Technische Dokumentation](claude.md) - Tech Stack Details
- [Projekt Timeline](projekt-timeline.md) - 8-Wochen Entwicklungsplan

## Team

**JOCH** - Deutschrock mit Metal aus Bremen-Nord, seit 2022
- 3 Bandmitglieder
- Genre: Deutschrock mit Metal-Einflüssen
- Standort: Bremen-Nord

---

🤘 Powered by JOCH
