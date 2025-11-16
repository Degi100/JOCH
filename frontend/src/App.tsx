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
import LightMixerPopout from './pages/LightMixerPopout/LightMixerPopout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ConcertOverlay from './components/ConcertOverlay/ConcertOverlay';
import SongControls from './components/SongControls/SongControls';
import { useConcertMode } from './hooks/useConcertMode';
import './styles/main.scss';

const App: React.FC = () => {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showSongControls, setShowSongControls] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [broadcastChannel] = useState(() => new BroadcastChannel('concert-mode-events'));

  // Current song URL
  const concertSongUrl = songs.length > 0 && songs[currentSongIndex]?.audioFile
    ? songs[currentSongIndex].audioFile
    : undefined;

  // Load all songs for concert mode
  useEffect(() => {
    const loadConcertSongs = async () => {
      try {
        console.log('🎶 Loading songs from API...');
        const loadedSongs = await songService.getAll();
        console.log('📚 Songs loaded:', loadedSongs);

        if (loadedSongs.length > 0) {
          setSongs(loadedSongs);
          console.log('✅ Loaded', loadedSongs.length, 'songs for concert mode');
        } else {
          console.warn('⚠️ No songs available in database');
        }
      } catch (error) {
        console.error('❌ Failed to load concert songs:', error);
      }
    };

    loadConcertSongs();
  }, []);

  // Listen for events from pop-out window (lightControl + ledControl from mixer)
  useEffect(() => {
    const handleBroadcastMessage = (event: MessageEvent) => {
      const { type, detail } = event.data;

      // Re-dispatch lightControl events from popout window in main window
      if (type === 'lightControl') {
        console.log('🎛️ Main: Received lightControl from popout, re-dispatching locally:', detail);
        window.dispatchEvent(new CustomEvent('lightControl', { detail }));
      }
      // Re-dispatch ledControl events from popout window in main window
      else if (type === 'ledControl') {
        console.log('📺 Main: Received ledControl from popout, re-dispatching locally:', detail);
        window.dispatchEvent(new CustomEvent('ledControl', { detail }));
      }
    };

    broadcastChannel.addEventListener('message', handleBroadcastMessage);
    return () => {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    };
  }, [broadcastChannel]);

  // Beat handler - trigger lightshow effects on beat
  const handleBeat = () => {
    const newCount = beatCount + 1;
    setBeatCount(newCount);

    const beatDetail = {
      beatNumber: newCount,
      timestamp: Date.now()
    };

    // Trigger custom event for beat-sync effects
    const beatEvent = new CustomEvent('musicBeat', {
      detail: beatDetail
    });
    window.dispatchEvent(beatEvent);

    // Broadcast to pop-out windows
    broadcastChannel.postMessage({
      type: 'musicBeat',
      detail: beatDetail
    });

    console.log('🥁 Beat #', newCount);
  };

  // Handle song end
  const handleSongEnded = () => {
    console.log('🎵 Song ended - showing controls');
    setShowSongControls(true);
  };

  // Play next song
  const handleNextSong = () => {
    console.log('⏭️ Next song requested');
    setShowSongControls(false);

    // Stop current show
    stopConcertMode();

    // Wait a bit, then switch to next song and restart show
    setTimeout(() => {
      if (currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        console.log('▶️ Playing song', currentSongIndex + 2, 'of', songs.length);
      } else {
        console.log('🔄 Reached end of playlist, wrapping to first song');
        setCurrentSongIndex(0);
      }

      // Restart show with new song
      setTimeout(() => {
        startConcertMode();
      }, 300);
    }, 500);
  };

  // Replay current song - restart entire show from beginning
  const handleReplaySong = () => {
    console.log('🔁 Replay requested - restarting show from beginning');
    setShowSongControls(false);

    // Stop current show
    stopConcertMode();

    // Wait a bit, then restart show with same song
    setTimeout(() => {
      console.log('🎬 Restarting show with same song');
      startConcertMode();
    }, 500);
  };

  const { concertMode, countdown, startConcertMode, stopConcertMode, isShowActive } = useConcertMode({
    musicUrl: concertSongUrl,
    onBeat: handleBeat,
    onSongEnded: handleSongEnded,
  });

  // Reset lightshow when concert mode starts (to clear warm-up phase, beat counts, etc.)
  useEffect(() => {
    if (concertMode === 'countdown') {
      console.log('🔄 Concert mode starting - resetting lightshow state');
      window.dispatchEvent(new CustomEvent('lightshowReset'));
    }
  }, [concertMode]);

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
          <SongControls
            currentSong={songs[currentSongIndex]?.title}
            currentIndex={currentSongIndex}
            totalSongs={songs.length}
            onNext={handleNextSong}
            onReplay={handleReplaySong}
            visible={showSongControls && isShowActive}
          />
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
              <Route path="/light-mixer-popout" element={<LightMixerPopout />} />
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
