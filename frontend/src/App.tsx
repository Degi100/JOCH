// ============================================
// JOCH Bandpage - Main App Component
// Router setup with AuthProvider
// ============================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home/Home';
import Band from './pages/Band/Band';
import Live from './pages/Live/Live';
import Music from './pages/Music/Music';
import News from './pages/News/News';
import NewsDetail from './pages/News/NewsDetail';
import Contact from './pages/Contact/Contact';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import GigManager from './pages/Admin/GigManager';
import NewsManager from './pages/Admin/NewsManager';
import MusicManager from './pages/Admin/MusicManager';
import GalleryManager from './pages/Admin/GalleryManager';
import BandManager from './pages/Admin/BandManager';
import MessagesManager from './pages/Admin/MessagesManager';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import './styles/main.scss';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/band" element={<Band />} />
              <Route path="/live" element={<Live />} />
              <Route path="/music" element={<Music />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/gigs"
                element={
                  <PrivateRoute>
                    <GigManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <PrivateRoute>
                    <NewsManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/music"
                element={
                  <PrivateRoute>
                    <MusicManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <PrivateRoute>
                    <GalleryManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/band"
                element={
                  <PrivateRoute>
                    <BandManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <PrivateRoute>
                    <MessagesManager />
                  </PrivateRoute>
                }
              />

              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
