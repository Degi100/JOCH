# JOCH Bandpage - Website-Konzept & Aufbau

**Stand:** 2025-11-04
**Status:** Konzeptphase

---

## Inhaltsverzeichnis
1. [Vision & Ziele](#vision--ziele)
2. [Zielgruppe](#zielgruppe)
3. [Website-Struktur](#website-struktur)
4. [Seiten-Details](#seiten-details)
5. [Design-Konzept](#design-konzept)
6. [Content-Strategie](#content-strategie)
7. [User Journeys](#user-journeys)
8. [Admin/CMS Funktionen](#admincms-funktionen)

---

## Vision & Ziele

### Vision
Eine authentische, kraftvolle Online-Präsenz für JOCH, die die Energie und Haltung der Band digital erlebbar macht.

### Hauptziele
1. **Sichtbarkeit erhöhen** - Neue Fans gewinnen
2. **Community aufbauen** - Bestehende Fans binden
3. **Gig-Promotion** - Konzerte bewerben und Tickets verkaufen
4. **Musik präsentieren** - Songs mit Lyrics zugänglich machen
5. **Booking erleichtern** - Kontakt für Veranstalter

### Erfolgs-Metriken
- Gig-Anmeldungen über Website
- Newsletter-Anmeldungen
- Social Media Shares
- Zeit auf Seite (Engagement)

---

## Zielgruppe

### Primäre Zielgruppe
- **Alter:** 25-70 Jahre
- **Interessen:** Deutschrock, Metal, Live-Musik
- **Region:** Bremen-Nord, Bremen, Umland
- **Verhalten:**
  - Geht regelmäßig auf Konzerte
  - Aktiv auf Social Media
  - Schätzt authentische Musik
  - Interessiert an gesellschaftskritischen Themen

### Sekundäre Zielgruppe
- **Veranstalter & Booker** - Suchen nach Bands für Events
- **Musikjournalisten** - Recherchieren für Artikel/Reviews
- **Andere Bands** - Netzwerken, Support-Slots

---

## Website-Struktur

### Sitemap

```
JOCH Bandpage
│
├── 🏠 HOME
│   ├── Hero Section
│   ├── Featured News
│   ├── Nächste Gigs
│   └── Featured Song
│
├── 👥 DIE BAND
│   ├── Band-Story
│   ├── Bandmitglieder (3) - mit interaktivem Hover/Rotation Effekt
│   └── Bremen-Nord Connection
│
├── 🎵 MUSIK
│   ├── Song-Liste
│   ├── Audio Player
│   ├── Lyrics (!)
│   └── Streaming-Links
│
├── 🎸 LIVE
│   ├── Kommende Gigs
│   ├── Vergangene Shows
│   └── Live-Galerie
│
├── 📰 NEWS
│   ├── News-Liste
│   └── News-Detail-Seiten
│
├── 📧 KONTAKT
│   ├── Booking-Anfragen
│   ├── Social Media Links
│   └── Newsletter (optional)
│
└── 🔒 ADMIN (versteckt)
    ├── Login
    ├── Dashboard
    ├── Gig-Manager
    ├── News-Manager
    ├── Song-Manager
    └── Bilder-Manager
```

---

## Seiten-Details

### 🏠 HOME / Landing Page

**Ziel:** Ersten Eindruck vermitteln, Besucher fesseln

#### Sections:

**1. Hero Section**
```
- Großes Band-Foto (dunkel, rau, industriell)
- Band-Statement: "Deutschrock mit Metal im Blut und Haltung im Herzen"
- Call-to-Action: "Nächster Gig" Button
- Scroll-Indicator
```

**2. Aktuelles / Featured News**
```
- Letzte 2-3 News-Posts als Cards
- Teaser-Text (2-3 Zeilen)
- "Mehr News" Link
```

**3. Nächste Gigs**
```
- Nächste 3 kommende Gigs
- Datum, Location, Stadt
- "Tickets" / "Info" Buttons
- "Alle Gigs" Link
```

**4. Featured Song**
```
- Audio Player mit aktuellem/wichtigem Song
- Cover Art
- Lyrics-Teaser
- "Mehr Musik" Link
```

**5. Newsletter / Social**
```
- Newsletter-Anmeldung (optional)
- Social Media Icons (Instagram, Facebook, Spotify, etc.)
```

---

### 👥 DIE BAND

**Ziel:** Band persönlich & authentisch vorstellen

#### Content:

**1. Band-Story**
```
- Seit 2022 in Bremen-Nord
- Wie alles begann
- Musikalische Entwicklung
- Was uns antreibt
- Bremen-Nord Connection
```

**2. Interaktives Band-Foto mit Hover/Rotation-Effekt**
```
Hauptfoto: /bilder/JOCH.jpg (Gruppenfoto mit Logo)

Interaktive Features:
- Desktop: Hover über Bandmitglied → Gradient Overlay + Info
- Mobile: Automatische Rotation alle 3 Sekunden
- Touch: Wechsel zwischen Mitgliedern
- Zweiter Touch auf gleiches Mitglied: Pausiert Rotation
- Visuell: Rote Umrandung beim Hover/Aktiv
- Info beim Hover: Name + Instrument

Technische Details:
- 3 Hover-Bereiche (Links, Mitte, Rechts)
- Gradient Overlay von unten nach oben
- Border-Animation beim Aktivieren
- Rotation-Indicator (Dots) unter dem Foto
- Play/Pause Button bei gestoppter Rotation
- Smooth Transitions (0.6s)
```

**3. Bandmitglieder Details (optional separate Section)**
```
Für jedes Mitglied (wenn mehr Info gewünscht):
- Name
- Instrument/Rolle
- Kurze Bio (3-5 Sätze)
- Fun Fact (optional)
```

---

### 🎵 MUSIK

**Ziel:** Songs hörbar & Texte lesbar machen

#### Content:

**1. Song-Liste**
```
Für jeden Song:
- Cover Art (Thumbnail)
- Titel
- Album/Single (optional)
- Release-Datum
- Audio Player
- Lyrics (ausklappbar oder auf Detail-Seite)
- Streaming-Links (Spotify, YouTube, etc.)
```

**2. Audio Player**
```
- HTML5 Audio Player
- Play/Pause
- Progress Bar
- Volume Control
- Current Time / Duration
- Simple, clean Design
```

**3. Lyrics-Anzeige**
```
- Wichtig: Sozialkritische Texte lesbar machen!
- Gut lesbare Typografie
- Strophen/Refrain-Struktur erkennbar
- Copy-Button (optional)
```

**4. Filter (später, optional)**
```
- Nach Album
- Nach Jahr
- Nach Theme/Topic
```

---

### 🎸 LIVE

**Ziel:** Gigs promoten, vergangene Shows dokumentieren

#### Sections:

**1. Kommende Gigs**
```
Für jeden Gig:
- Datum (groß, prominent)
- Location/Venue
- Stadt
- Support Bands (optional)
- Ticket-Link
- Facebook-Event Link
- "In Kalender eintragen" Button
- Karte/Anfahrt (optional, später)
```

**2. Vergangene Shows**
```
- Chronologische Liste (neueste zuerst)
- Datum + Location
- Live-Fotos (Galerie)
- Setlist (optional)
```

**3. Live-Galerie**
```
- Kategorien: Nach Jahr, Nach Location
- Lightbox-Ansicht
- Social Share-Funktion
```

---

### 📰 NEWS

**Ziel:** Fans auf dem Laufenden halten

#### News-Liste
```
Für jeden Post:
- Featured Image
- Titel
- Datum
- Teaser (2-3 Zeilen)
- "Weiterlesen" Button
- Tags (optional): Tour, Release, Behind-the-Scenes
```

#### News-Detail-Seite
```
- Featured Image (groß)
- Titel
- Datum + Autor
- Volltext
- Bilder-Galerie (optional)
- Social Share Buttons
- "Zurück zur Übersicht"
- Nächster/Vorheriger Post Navigation
```

#### News-Kategorien (optional)
```
- Tour-Updates
- Neue Releases
- Behind-the-Scenes
- Statements/Haltung
```

---

### 📧 KONTAKT

**Ziel:** Anfragen ermöglichen, Vernetzung fördern

#### Sections:

**1. Booking-Anfragen**
```
- Kontaktformular:
  - Name
  - Email
  - Event-Typ (Konzert, Festival, etc.)
  - Datum
  - Nachricht
- Oder Email-Adresse: booking@joch-band.de
```

**2. Allgemeine Anfragen**
```
- Email: info@joch-band.de
```

**3. Social Media**
```
- Instagram
- Facebook
- Spotify
- YouTube
- Bandcamp (optional)
```

**4. Newsletter (optional)**
```
- Anmeldung mit Email
- DSGVO-Hinweis
- Double-Opt-In
```

---

### 🔒 ADMIN / CMS

**Ziel:** Bandmitglieder können Content selbst pflegen

#### Dashboard
```
- Übersicht:
  - Anzahl Gigs (upcoming/past)
  - Anzahl News-Posts
  - Anzahl Songs
  - Letzte Aktivitäten
- Quick Actions:
  - Neuer Gig
  - Neuer News-Post
  - Neuer Song
```

#### Gig-Manager
```
CRUD Funktionen:
- Liste aller Gigs (upcoming/past)
- Neuer Gig erstellen:
  - Datum
  - Location/Venue
  - Stadt
  - Ticket-Link
  - Facebook-Event
  - Support Bands
  - Setlist (optional)
- Gig bearbeiten
- Gig löschen
- Status: upcoming/cancelled/past
```

#### News-Manager
```
CRUD Funktionen:
- Liste aller Posts
- Neuer Post erstellen:
  - Titel
  - Teaser
  - Volltext (WYSIWYG Editor)
  - Featured Image Upload
  - Galerie (optional)
  - Tags
  - Status: Draft/Published
  - Publish-Datum
- Post bearbeiten
- Post löschen
```

#### Song-Manager
```
CRUD Funktionen:
- Liste aller Songs
- Neuer Song erstellen:
  - Titel
  - Album/Single
  - Release-Datum
  - Audio-File Upload (MP3)
  - Cover Art Upload
  - Lyrics (Textarea)
  - Streaming-Links
- Song bearbeiten
- Song löschen
- Reihenfolge ändern (Drag & Drop)
```

#### Bilder-Manager
```
- Upload von Bildern
- Kategorien: Live, Band, Promo
- Galerie-Ansicht
- Bilder löschen
- Bilder zu News/Gigs zuordnen
```

#### Band-Info Editor
```
- Band-Story bearbeiten
- Bandmitglieder:
  - Name, Instrument, Bio bearbeiten
  - Foto hochladen
```

---

## Design-Konzept

### Visuelle Identität

**Farbpalette:**
```scss
// Basis
$black: #1a1a1a;           // Haupthintergrund
$gray-dark: #2d2d2d;       // Cards, Sections
$gray-medium: #4a4a4a;     // Borders, Disabled
$gray-light: #f0f0f0;      // Text auf dunkel

// Akzente
$red: #e63946;             // Primary Action (CTA, Links)
$orange: #ff6b35;          // Secondary Action, Highlights
$rust: #c44536;            // Hover-States

// Status
$success: #52b788;
$warning: #f77f00;
$error: #d62828;
```

**Typografie:**
```scss
// Headlines
$font-headline: 'Bebas Neue', 'Impact', sans-serif;  // Kraftvoll
// oder:
$font-headline: 'Oswald', sans-serif;  // Klar & stark

// Body Text
$font-body: 'Inter', 'Roboto', sans-serif;  // Gut lesbar

// Lyrics (monospace optional)
$font-lyrics: 'Source Code Pro', monospace;
```

**Spacing System:**
```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 2rem;      // 32px
$spacing-xl: 4rem;      // 64px
```

**Breakpoints:**
```scss
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;
```

---

### Design-Prinzipien

1. **Dunkel & Rau**
   - Dunkler Hintergrund überall
   - Raue Texturen (subtle)
   - Industrieller Look

2. **Authentizität über Hochglanz**
   - Echte Fotos, nicht gestellte Stock-Bilder
   - Ehrliche Texte
   - Keine Übertreibungen

3. **Kontrast & Lesbarkeit**
   - Hoher Kontrast für Text
   - Rot/Orange nur für Highlights
   - Große, klare Schriften

4. **Mobile First**
   - Design für Smartphone zuerst
   - Touch-freundliche Buttons (min 44x44px)
   - Einfache Navigation

5. **Performance**
   - Schnell ladend
   - Optimierte Bilder (WebP)
   - Lazy Loading

---

### UI-Komponenten

**Interaktives Band-Foto (Spezial-Component):**
```scss
// BandPhoto Component mit Hover/Rotation
.bandPhoto {
  position: relative;
  width: 100%;

  .memberOverlay {
    position: absolute;
    width: 33.33%;
    height: 100%;
    opacity: 0;
    transition: all 0.6s ease;

    // Gradient Overlay beim Hover/Aktiv
    &.active, &:hover {
      opacity: 1;
      background: linear-gradient(
        to top,
        rgba($black, 0.95) 0%,
        rgba($black, 0.85) 30%,
        rgba($black, 0.6) 60%,
        transparent 100%
      );
    }

    // Rote Umrandung beim Hover
    &::before {
      content: '';
      border: 3px solid $red;
      opacity: 0;
      transform: scale(0.95);
      transition: all 0.6s ease;
    }

    &.active::before, &:hover::before {
      opacity: 1;
      transform: scale(1);
    }
  }

  .memberInfo {
    position: absolute;
    bottom: 30px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;

    .name {
      font-family: $font-headline;
      font-size: 1.8rem;
      color: $red;
      text-transform: uppercase;
      text-shadow: 2px 2px 4px rgba($black, 0.8);
    }

    .instrument {
      color: $gray-light;
      text-shadow: 1px 1px 2px rgba($black, 0.8);
    }
  }

  // Rotation Indicator Dots
  .rotationIndicator {
    display: flex;
    gap: 10px;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba($gray-light, 0.3);
      border: 2px solid rgba($gray-light, 0.5);

      &.activeDot {
        background: $red;
        border-color: $red;
        transform: scale(1.3);
      }
    }
  }
}

Features:
- Automatische Rotation alle 3 Sekunden (Mobile)
- Hover pausiert Rotation (Desktop)
- Touch zum Wechseln (Mobile)
- Play/Pause Button bei manueller Pause
- Keyboard-Navigation (Accessibility)
```

**Buttons:**
```scss
// Primary Button
.btn-primary {
  background: $red;
  color: $white;
  padding: 12px 24px;
  border: none;
  font-weight: bold;
  text-transform: uppercase;

  &:hover {
    background: darken($red, 10%);
  }
}

// Secondary Button
.btn-secondary {
  background: transparent;
  color: $red;
  border: 2px solid $red;

  &:hover {
    background: $red;
    color: $white;
  }
}
```

**Cards:**
```scss
.card {
  background: $gray-dark;
  border: 1px solid rgba($gray-light, 0.1);
  padding: $spacing-lg;
  border-radius: 4px;

  &:hover {
    border-color: $red;
    transform: translateY(-2px);
    transition: all 0.3s;
  }
}
```

**Navigation:**
```scss
// Header: Fixed, dunkel, transparent on scroll
// Mobile: Hamburger Menu
// Desktop: Horizontal Links
```

---

## Content-Strategie

### Content-Typen & Frequenz

**Gigs:**
- Bei Bestätigung sofort eintragen
- Mindestens 2 Wochen vor Show promoten
- Nach Show: Fotos hochladen

**News:**
- Mindestens 1x pro Monat
- Vor/nach Shows
- Bei neuen Releases
- Behind-the-Scenes

**Songs:**
- Bei Release sofort hochladen
- Lyrics pflegen!
- Streaming-Links ergänzen

**Social Media:**
- Website-Link in Bio
- Posts teilen (Instagram → News)
- Gig-Reminder posten

---

### Content-Guidelines

**Tonalität:**
- Ehrlich, direkt, ungefiltert
- Keine Marketing-Floskeln
- Authentische Sprache
- Sozialkritisch wo relevant

**Text-Längen:**
- News Teaser: 2-3 Zeilen (max 200 Zeichen)
- News Volltext: 300-800 Wörter
- Band-Bio: 150-300 Wörter pro Person
- Song-Beschreibung: Optional, 2-3 Sätze

**Bilder:**
- Format: JPG/WebP
- Mindestgröße: 1920x1080px
- Authentisch, live, ungefiltert
- Kein Stock-Material

---

## User Journeys

### Journey 1: Neuer Fan entdeckt JOCH

```
1. Landet auf Homepage (Social Media Link)
   → Sieht Hero Image & Statement
   → Erste Impression: "Stark, authentisch"

2. Scrollt runter
   → Sieht nächsten Gig in seiner Stadt
   → Klickt auf "Tickets"

3. Navigiert zu MUSIK
   → Hört ersten Song
   → Liest Lyrics: "Wow, das spricht mir aus der Seele"

4. Navigiert zu DIE BAND
   → Lernt Band kennen
   → "Aus Bremen-Nord, wie ich!"

5. Folgt auf Social Media
   → Abonniert Newsletter (optional)

RESULTAT: Neuer Fan, geht aufs Konzert ✅
```

### Journey 2: Veranstalter sucht Band

```
1. Google: "Deutschrock Band Bremen"
   → Findet JOCH Website

2. Navigiert zu LIVE
   → Sieht vergangene Shows
   → Prüft Locations: "Die spielen auch größere Venues"

3. Hört Songs in MUSIK
   → "Passt gut zu unserem Event"

4. Navigiert zu KONTAKT
   → Füllt Booking-Formular aus

RESULTAT: Booking-Anfrage ✅
```

### Journey 3: Fan checkt nächsten Gig

```
1. Direkter Besuch: joch-band.de
   → Kennt die Seite schon

2. Schaut direkt auf LIVE
   → Sieht nächsten Gig nächste Woche
   → Klickt "In Kalender"

3. Checkt NEWS
   → Liest neuen Post über Tour

4. Verlässt Seite zufrieden

RESULTAT: Fan bleibt informiert ✅
```

---

## Admin/CMS Funktionen

### User Management

**Rollen:**
```
- Admin (volle Rechte)
- Editor (Content erstellen/bearbeiten)
- Viewer (nur lesen, optional)
```

**Initiale User:**
- 3 Bandmitglieder (alle Admin)

**Auth:**
- Email + Passwort
- JWT Token
- Session Timeout: 7 Tage

---

### Content-Workflows

**Neuer Gig:**
```
1. Login ins Admin
2. "Neuer Gig" klicken
3. Formular ausfüllen:
   - Datum (Date Picker)
   - Location (Text)
   - Stadt (Text)
   - Ticket-Link (URL)
4. "Speichern"
5. Gig erscheint automatisch auf /live
```

**Neuer News-Post:**
```
1. "Neuer Post" klicken
2. Titel eingeben
3. Teaser schreiben
4. Volltext schreiben (WYSIWYG Editor)
5. Featured Image hochladen
6. Status: Draft oder Published
7. "Speichern"
8. Post erscheint auf /news
```

**Neuer Song:**
```
1. "Neuer Song" klicken
2. Titel eingeben
3. MP3 hochladen (max 10MB)
4. Cover Art hochladen
5. Lyrics eingeben (Textarea)
6. Streaming-Links (optional)
7. "Speichern"
8. Song erscheint auf /musik
```

---

### Mobile Admin (optional, später)

```
- Responsive Admin-Interface
- Bandmitglieder können auch vom Handy posten
- Wichtig für spontane News (z.B. nach Show)
```

---

## SEO & Performance

### SEO Basics

**Meta Tags:**
```html
<title>JOCH - Deutschrock aus Bremen-Nord</title>
<meta name="description" content="JOCH - Deutschrock mit Metal im Blut und Haltung im Herzen. Seit 2022 aus Bremen-Nord.">
<meta name="keywords" content="JOCH, Deutschrock, Metal, Bremen, Bremen-Nord, Live-Musik">
```

**Open Graph (Social Sharing):**
```html
<meta property="og:title" content="JOCH - Deutschrock aus Bremen-Nord">
<meta property="og:image" content="/og-image.jpg">
<meta property="og:description" content="...">
```

**Schema.org Markup:**
```json
{
  "@type": "MusicGroup",
  "name": "JOCH",
  "genre": "Deutschrock",
  "foundingDate": "2022",
  "foundingLocation": "Bremen-Nord"
}
```

---

### Performance-Ziele

```
Lighthouse Score:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

Loading Time:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
```

**Optimierungen:**
- Bilder: WebP Format, Lazy Loading
- Code: Minification, Tree Shaking
- Fonts: Subset, Preload
- Caching: Service Worker (optional, später)

---

## Launch-Checkliste

### Pre-Launch

- [ ] Alle Seiten funktionieren
- [ ] Mobile optimiert
- [ ] Cross-Browser getestet (Chrome, Firefox, Safari)
- [ ] SSL Zertifikat installiert
- [ ] Domain konfiguriert
- [ ] Impressum & Datenschutz
- [ ] Cookie-Banner (falls Tracking)
- [ ] Google Analytics / Matomo (optional)
- [ ] 404-Seite gestylt
- [ ] Kontaktformular getestet
- [ ] Admin-Login getestet

### Content-Befüllung

- [ ] Band-Story geschrieben
- [ ] Bandmitglieder-Bios geschrieben
- [ ] Mindestens 3 Songs hochgeladen (mit Lyrics!)
- [ ] Alle kommenden Gigs eingetragen
- [ ] Mindestens 5 vergangene Gigs dokumentiert
- [ ] Mindestens 10 Live-Fotos hochgeladen
- [ ] Mindestens 3 News-Posts geschrieben
- [ ] Social Media Links eingetragen
- [ ] Band-Fotos hochgeladen

### Post-Launch

- [ ] Social Media Announcement
- [ ] Website-Link in allen Social Media Bios
- [ ] Google Search Console einreichen
- [ ] Lokale Musikblogs informieren
- [ ] Freunde/Familie teilen lassen
- [ ] Erste Woche: Monitoring (Analytics, Fehler)

---

## Zukünftige Features (Post-Launch)

### Phase 2
- [ ] Newsletter-System
- [ ] Video Player (YouTube Embeds)
- [ ] Lyrics-Suche
- [ ] Konzert-Karte (Google Maps Integration)
- [ ] Gästebuch (optional)

### Phase 3
- [ ] Mehrsprachig (Deutsch/Englisch)
- [ ] Dark/Light Mode Toggle (oder immer dark?)
- [ ] Merch Shop Integration
- [ ] Fans-Section (User-Generated Content)
- [ ] Live-Stream Integration

### Phase 4
- [ ] Mobile App (optional)
- [ ] Push-Benachrichtigungen für neue Gigs
- [ ] Ticket-Verkauf direkt auf Website
- [ ] Member-Bereich (exklusiver Content)

---

**Ende des Konzepts**

Nächster Schritt: Umsetzung starten! 🚀
