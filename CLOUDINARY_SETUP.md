# Cloudinary Setup-Anleitung

## 🎯 Warum Cloudinary?

Render.com (dein Backend-Host) hat ein **ephemeral filesystem** → hochgeladene Dateien gehen verloren bei Server-Restart.

Cloudinary löst das Problem:
- ✅ Permanente Cloud-Storage
- ✅ Automatische Bild-Optimierung
- ✅ CDN (schnell weltweit)
- ✅ **Komplett kostenlos** (Free Tier reicht für JOCH!)

---

## 📋 Setup (5 Minuten)

### Step 1: Cloudinary Account erstellen

1. Gehe zu **https://cloudinary.com**
2. Klicke auf **"Sign Up for Free"**
3. Registriere dich mit:
   - Email
   - Oder Google/GitHub Account

### Step 2: Credentials kopieren

Nach dem Login siehst du dein **Dashboard**:

```
┌─────────────────────────────────────────┐
│ Cloudinary Dashboard                    │
├─────────────────────────────────────────┤
│ Account Details:                        │
│                                         │
│ Cloud name:    joch-band-xyz            │ ← WICHTIG
│ API Key:       123456789012345          │ ← WICHTIG
│ API Secret:    abcdefghijklmnopqrstuv   │ ← WICHTIG
│                                         │
│ [Show/Hide API Secret] Button           │
└─────────────────────────────────────────┘
```

**Klicke auf "Show API Secret"** und kopiere alle 3 Werte!

### Step 3: Backend .env aktualisieren

Öffne `backend/.env` und füge hinzu:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=joch-band-xyz       # ← Dein Cloud Name
CLOUDINARY_API_KEY=123456789012345        # ← Dein API Key
CLOUDINARY_API_SECRET=abcdefghijklmnopqr  # ← Dein API Secret
```

**WICHTIG:** Ersetze die Werte mit deinen echten Credentials!

### Step 4: Backend neu starten

```bash
# Stoppe den laufenden Server (Ctrl+C)
# Dann starte neu:
cd backend
npm run dev
```

Du solltest sehen:
```
✅ Cloudinary configured successfully
```

---

## ✅ Test: Bild hochladen

1. Gehe zu **http://localhost:5173/admin/band**
2. Klicke auf **"+ Neues Mitglied"**
3. Fülle das Formular aus
4. **Wähle ein Bild** (max 10MB)
5. Klicke **"Erstellen"**

**Erfolg:**
- Bild wird zu Cloudinary hochgeladen
- Du siehst es im Bandmitglieder-Manager
- URL sieht so aus: `https://res.cloudinary.com/joch-band-xyz/image/upload/...`

---

## 🔧 Cloudinary Dashboard Features

### 1. Media Library (alle Uploads sehen)
- Gehe zu **Media Library** im Dashboard
- Hier siehst du alle hochgeladenen Bilder/Audio-Dateien
- Organisiert in Ordnern:
  ```
  joch-band/
  ├── images/        ← Bandmitglieder-Fotos
  ├── gallery/       ← Galerie-Bilder
  └── audio/         ← Song MP3-Dateien
  ```

### 2. Usage Statistics
- Zeigt dir Storage & Bandwidth-Verbrauch
- Free Tier: 25GB Storage + 25GB Bandwidth/Monat
- Für JOCH völlig ausreichend!

### 3. Transformations (automatisch)
Cloudinary optimiert Bilder automatisch:
- Komprimierung
- Format-Konvertierung (WebP für moderne Browser)
- Responsive Sizes

---

## 🚀 Deployment (Render.com)

Wenn du dein Backend auf Render.com deployed hast:

1. Gehe zu **Render.com Dashboard**
2. Wähle dein **joch-backend** Service
3. Klicke auf **"Environment"**
4. Füge die Environment Variables hinzu:

```
CLOUDINARY_CLOUD_NAME = joch-band-xyz
CLOUDINARY_API_KEY = 123456789012345
CLOUDINARY_API_SECRET = abcdefghijklmnopqrstuv
```

5. Klicke **"Save Changes"**
6. Render startet Server neu → Cloudinary ist live! ✅

---

## 📊 Free Tier Limits

**Was du kostenlos bekommst:**
- ✅ 25 GB Storage
- ✅ 25 GB Bandwidth/Monat
- ✅ 25,000 Transformationen/Monat
- ✅ Unbegrenzte Uploads
- ✅ CDN inklusive

**Reicht das für JOCH?**
```
Beispiel-Rechnung:
- 3 Bandmitglieder × 2MB = 6MB
- 50 Galerie-Bilder × 3MB = 150MB
- 10 Songs × 5MB = 50MB
─────────────────────────────
Total: ~200MB

= 0.8% des Free Tiers genutzt ✅
```

Du kannst **Jahre** kostenlos laufen lassen!

---

## ❓ Troubleshooting

### Problem: "Cloudinary credentials not configured"

**Lösung:**
1. Checke `backend/.env` - sind die Variablen gesetzt?
2. Starte Backend neu (`npm run dev`)

### Problem: "Upload failed" Error 500

**Lösung:**
1. Checke Cloudinary Dashboard → API Keys korrekt?
2. Checke Backend Console - zeigt es einen Error?
3. Teste API Key auf https://cloudinary.com/console

### Problem: Bilder werden nicht angezeigt

**Lösung:**
1. Checke die URL - sieht sie so aus: `https://res.cloudinary.com/...`?
2. Öffne die URL direkt im Browser
3. Checke Cloudinary Media Library - ist das Bild da?

---

## 🎸 Fertig!

Du hast jetzt:
- ✅ Persistenten Cloud-Storage
- ✅ Automatische Bild-Optimierung
- ✅ CDN für schnelle Ladezeiten
- ✅ Keine Sorgen mehr über verlorene Uploads

**Viel Erfolg mit JOCH! 🤘**

---

**Support:**
- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com
