// ============================================
// JOCH Bandpage - Admin Dashboard
// Overview and quick access for band members
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import styles from './Dashboard.module.scss';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

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
          <h2 className={styles.sectionTitle}>Content Management</h2>

          <div className={styles.managementGrid}>
            {/* Gigs Management */}
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Gigs verwalten</h3>
                <span className={styles.cardIcon}>🎸</span>
              </div>
              <p className={styles.cardDescription}>
                Kommende und vergangene Konzerte verwalten
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/admin/gigs')}
              >
                Gigs verwalten
              </Button>
            </div>

            {/* News Management */}
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>News verwalten</h3>
                <span className={styles.cardIcon}>📰</span>
              </div>
              <p className={styles.cardDescription}>
                Blog-Posts und Updates erstellen und bearbeiten
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/admin/news')}
              >
                News verwalten
              </Button>
            </div>

            {/* Music Management */}
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Musik verwalten</h3>
                <span className={styles.cardIcon}>🎵</span>
              </div>
              <p className={styles.cardDescription}>
                Songs hochladen und Releases verwalten
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/admin/music')}
              >
                Musik verwalten
              </Button>
            </div>

            {/* Gallery Management */}
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Galerie verwalten</h3>
                <span className={styles.cardIcon}>📸</span>
              </div>
              <p className={styles.cardDescription}>
                Bilder hochladen und organisieren
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/admin/gallery')}
              >
                Galerie verwalten
              </Button>
            </div>

            {/* Band Info */}
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Band-Info</h3>
                <span className={styles.cardIcon}>👥</span>
              </div>
              <p className={styles.cardDescription}>
                Bandmitglieder und Bandgeschichte bearbeiten
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/admin/band')}
              >
                Band bearbeiten
              </Button>
            </div>

            {/* Messages */}
            <div className={styles.managementCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Nachrichten</h3>
                <span className={styles.cardIcon}>📧</span>
              </div>
              <p className={styles.cardDescription}>
                Kontaktanfragen und Booking-Requests
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/admin/messages')}
              >
                Nachrichten ansehen
              </Button>
            </div>
          </div>
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