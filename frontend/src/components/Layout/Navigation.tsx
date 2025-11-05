// ============================================
// JOCH Bandpage - Navigation Component
// Main navigation menu with active states
// ============================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.scss';

interface NavigationProps {
  onLinkClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLinkClick }) => {
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/band', label: 'Die Band' },
    { to: '/live', label: 'Live' },
    { to: '/music', label: 'Musik' },
    { to: '/news', label: 'News' },
    { to: '/contact', label: 'Kontakt' },
  ];

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {navLinks.map((link) => (
          <li key={link.to} className={styles.navItem}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onLinkClick}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
