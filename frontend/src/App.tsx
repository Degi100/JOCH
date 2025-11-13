// ============================================
// JOCH Bandpage - Main App Component
// Router setup with AuthProvider
// ============================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConcertModeProvider } from './context/ConcertModeContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home/Home';
import { songService } from './services';
import Band from './pages/Band/Band';
import Live from './pages/Live/Live';
import Music from './pages/Music/Music';
import News from './pages/News/News';
import NewsDetail from './pages/News/NewsDetail';
import Gallery from './pages/Gallery/Gallery';
import Guestbook from './pages/Guestbook/Guestbook';
import Contact from './pages/Contact/Contact';
import Login from './pages/Admin/Login';
import Register from './pages/Admin/Register';
import Dashboard from './pages/Admin/Dashboard';
import GigManager from './pages/Admin/GigManager';
import NewsManager from './pages/Admin/NewsManager';
import MusicManager from './pages/Admin/MusicManager';
import GalleryManager from './pages/Admin/GalleryManager';
import GuestbookManager from './pages/Admin/GuestbookManager';
import BandManager from './pages/Admin/BandManager';
import MessagesManager from './pages/Admin/MessagesManager';
import UserManager from './pages/Admin/UserManager';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ConcertOverlay from './components/ConcertOverlay/ConcertOverlay';
import { useConcertMode } from './hooks/useConcertMode';
import './styles/main.scss';

const App: React.FC = () => {
  const [concertSongUrl, setConcertSongUrl] = useState<string | undefined>();
  const [beatCount, setBeatCount] = useState(0);

  // Load first song for concert mode
  useEffect(() => {
    const loadConcertSong = async () => {
      try {
        console.log('🎶 Loading songs from API...');
        const songs = await songService.getAll();
        console.log('📚 Songs loaded:', songs);

        if (songs.length > 0 && songs[0].audioFile) {
          const audioUrl = songs[0].audioFile;
          console.log('🎵 Setting concert song URL:', audioUrl);
          setConcertSongUrl(audioUrl);
        } else {
          console.warn('⚠️ No songs available in database');
        }
      } catch (error) {
        console.error('❌ Failed to load concert song:', error);
      }
    };

    loadConcertSong();
  }, []);

  // Beat handler - trigger lightshow effects on beat
  const handleBeat = () => {
    const newCount = beatCount + 1;
    setBeatCount(newCount);

    // Trigger custom event for beat-sync effects
    const beatEvent = new CustomEvent('musicBeat', {
      detail: {
        beatNumber: newCount,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(beatEvent);

    console.log('🥁 Beat #', newCount);
  };

  const { concertMode, countdown, startConcertMode, stopConcertMode, isShowActive } = useConcertMode({
    musicUrl: concertSongUrl,
    onBeat: handleBeat,
  });

  const handleConcertModeToggle = () => {
    if (isShowActive) {
      stopConcertMode();
    } else {
      // Prüfe ob Audio-URL vorhanden ist
      if (!concertSongUrl) {
        console.error('❌ No audio URL available yet!');
        alert('Musik lädt noch... Bitte kurz warten und nochmal versuchen!');
        return;
      }
      console.log('🎬 Starting concert mode with audio:', concertSongUrl);
      startConcertMode();
    }
  };

  return (
    <AuthProvider>
      <ConcertModeProvider isShowActive={isShowActive}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <ConcertOverlay concertMode={concertMode} countdown={countdown} />
          <div className="app">
            <Header
              onConcertModeToggle={handleConcertModeToggle}
              isConcertModeActive={isShowActive}
            />
            <main className="main-content">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/band" element={<Band />} />
              <Route path="/live" element={<Live />} />
              <Route path="/music" element={<Music />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/galerie" element={<Gallery />} />
              <Route path="/gaestebuch" element={<Guestbook />} />
              <Route path="/contact" element={<Contact />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/gigs"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <GigManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <NewsManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/music"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <MusicManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <GalleryManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/guestbook"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <GuestbookManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/band"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <BandManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <PrivateRoute requiredRoles={['admin', 'member']}>
                    <MessagesManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute requiredRoles={['admin']}>
                    <UserManager />
                  </PrivateRoute>
                }
              />

              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      </ConcertModeProvider>
    </AuthProvider>
  );
};

export default App;
