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
              {/* TODO: Add more routes later */}
              {/* <Route path="/band" element={<Band />} /> */}
              {/* <Route path="/live" element={<Live />} /> */}
              {/* <Route path="/music" element={<Music />} /> */}
              {/* <Route path="/news" element={<News />} /> */}
              {/* <Route path="/news/:slug" element={<NewsDetail />} /> */}
              {/* <Route path="/contact" element={<Contact />} /> */}
              {/* <Route path="/admin/*" element={<Admin />} /> */}
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
