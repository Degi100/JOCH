// ============================================
// JOCH Bandpage - Admin Dashboard
// Overview and quick access for band members
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import styles from './Dashboard.module.scss';

type ViewMode = 'cards' | 'table';

interface ManagementItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  buttonText: string;
  adminOnly?: boolean;
}

const MANAGEMENT_ITEMS: ManagementItem[] = [
  {
    id: 'gigs',
    title: 'Gigs verwalten',
    icon: '🎸',
    description: 'Kommende und vergangene Konzerte verwalten',
    route: '/admin/gigs',
    buttonText: 'Gigs verwalten',
  },
  {
    id: 'news',
    title: 'News verwalten',
    icon: '📰',
    description: 'Blog-Posts und Updates erstellen und bearbeiten',
    route: '/admin/news',
    buttonText: 'News verwalten',
  },
  {
    id: 'music',
    title: 'Musik verwalten',
    icon: '🎵',
    description: 'Songs hochladen und Releases verwalten',
    route: '/admin/music',
    buttonText: 'Musik verwalten',
  },
  {
    id: 'gallery',
    title: 'Galerie verwalten',
    icon: '📸',
    description: 'Bilder hochladen und organisieren',
    route: '/admin/gallery',
    buttonText: 'Galerie verwalten',
  },
  {
    id: 'band',
    title: 'Band-Info',
    icon: '👥',
    description: 'Bandmitglieder und Bandgeschichte bearbeiten',
    route: '/admin/band',
    buttonText: 'Band bearbeiten',
  },
  {
    id: 'messages',
    title: 'Nachrichten',
    icon: '📧',
    description: 'Kontaktanfragen und Booking-Requests',
    route: '/admin/messages',
    buttonText: 'Nachrichten ansehen',
  },
  {
    id: 'guestbook',
    title: 'Gästebuch',
    icon: '📖',
    description: 'Gästebuch-Einträge moderieren und verwalten',
    route: '/admin/guestbook',
    buttonText: 'Gästebuch verwalten',
  },
  {
    id: 'social',
    title: 'Social Media',
    icon: '🔗',
    description: 'Social Media Links verwalten (Instagram, YouTube, etc.)',
    route: '/admin/social',
    buttonText: 'Social Links verwalten',
  },
  {
    id: 'users',
    title: 'Benutzerverwaltung',
    icon: '👤',
    description: 'Benutzerrollen verwalten und Zugriffsrechte festlegen',
    route: '/admin/users',
    buttonText: 'Benutzer verwalten',
    adminOnly: true,
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('dashboard-view-mode');
    return (saved as ViewMode) || 'cards';
  });

  useEffect(() => {
    localStorage.setItem('dashboard-view-mode', viewMode);
  }, [viewMode]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const filteredItems = MANAGEMENT_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>JOCH Admin Dashboard</h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <p className={styles.welcome}>
            Willkommen zurück, <strong>{user?.name || user?.email}</strong>!
          </p>
        </header>

        {/* Quick Stats */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎸</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>0</h3>
              <p className={styles.statLabel}>Kommende Gigs</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📰</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>0</h3>
              <p className={styles.statLabel}>Veröffentlichte News</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎵</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>0</h3>
              <p className={styles.statLabel}>Songs</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📸</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>0</h3>
              <p className={styles.statLabel}>Bilder</p>
            </div>
          </div>
        </section>

        {/* Management Sections */}
        <section className={styles.management}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Content Management</h2>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'cards' ? styles.active : ''}`}
                onClick={() => setViewMode('cards')}
                title="Karten-Ansicht"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M4 5v5h5V5H4zm0 14h5v-5H4v5zm9 0h5v-5h-5v5zm0-14v5h5V5h-5z" />
                </svg>
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.active : ''}`}
                onClick={() => setViewMode('table')}
                title="Tabellen-Ansicht"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                </svg>
              </button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <div className={styles.managementGrid}>
              {filteredItems.map((item) => (
                <div key={item.id} className={styles.managementCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <span className={styles.cardIcon}>{item.icon}</span>
                  </div>
                  <p className={styles.cardDescription}>{item.description}</p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate(item.route)}
                  >
                    {item.buttonText}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.managementTable}>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Bereich</th>
                    <th className={styles.hideOnMobile}>Beschreibung</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} onClick={() => navigate(item.route)}>
                      <td className={styles.iconCell}>{item.icon}</td>
                      <td className={styles.titleCell}>{item.title}</td>
                      <td className={`${styles.descCell} ${styles.hideOnMobile}`}>
                        {item.description}
                      </td>
                      <td className={styles.actionCell}>
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(item.route);
                          }}
                        >
                          Öffnen
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Schnellzugriff</h2>
          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/gigs/new')}
            >
              + Neues Gig erstellen
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/news/new')}
            >
              + Neuen News-Post erstellen
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Zur Website
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
