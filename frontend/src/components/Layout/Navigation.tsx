// ============================================
// JOCH Bandpage - Navigation Component
// Main navigation menu with active states
// ============================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navigation.module.scss';

interface NavigationProps {
  onLinkClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLinkClick }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const publicNavLinks = [
    { to: '/', label: 'Home' },
    { to: '/band', label: 'Die Band' },
    { to: '/live', label: 'Live' },
    { to: '/music', label: 'Musik' },
    { to: '/news', label: 'News' },
    { to: '/galerie', label: 'Galerie' },
    { to: '/gaestebuch', label: 'Gästebuch' },
    { to: '/contact', label: 'Kontakt' },
  ];

  const handleLogout = () => {
    logout();
    if (onLinkClick) onLinkClick();
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {/* Public Navigation Links */}
        {publicNavLinks.map((link) => (
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

        {/* Auth-Based Navigation */}
        {isAuthenticated ? (
          <>
            {/* Admin/Member Dashboard */}
            {(user?.role === 'admin' || user?.role === 'member') && (
              <li className={styles.navItem}>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={onLinkClick}
                >
                  Admin
                </NavLink>
              </li>
            )}

            {/* Logout Button */}
            <li className={styles.navItem}>
              <button
                onClick={handleLogout}
                className={`${styles.navLink} ${styles.logoutButton}`}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            {/* Login Link */}
            <li className={styles.navItem}>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={onLinkClick}
              >
                Login
              </NavLink>
            </li>

            {/* Register Link */}
            <li className={styles.navItem}>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `${styles.navLink} ${styles.registerLink} ${isActive ? styles.active : ''}`
                }
                onClick={onLinkClick}
              >
                Registrieren
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
