// ============================================
// JOCH Bandpage - Header Component
// Sticky header with logo and navigation
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import SoundToggle from '../SoundToggle/SoundToggle';
import ConcertPlayButton from '../ConcertPlayButton/ConcertPlayButton';
import styles from './Header.module.scss';

interface HeaderProps {
  onConcertModeToggle?: () => void;
  isConcertModeActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onConcertModeToggle, isConcertModeActive = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <span className={styles.logoText}>JOCH</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Navigation onLinkClick={closeMobileMenu} />
        </div>

        {/* Concert Play Button */}
        <div className={styles.concertPlay}>
          <ConcertPlayButton
            onClick={onConcertModeToggle || (() => {})}
            isActive={isConcertModeActive}
          />
        </div>

        {/* Sound Toggle */}
        <div className={styles.soundToggle}>
          <SoundToggle />
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.open : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={styles.hamburger}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.overlay} onClick={closeMobileMenu} />
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={styles.mobileNav}>
            <Navigation onLinkClick={closeMobileMenu} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
