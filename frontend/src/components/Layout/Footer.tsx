// ============================================
// JOCH Bandpage - Footer Component
// 3-column footer with info, links, and social
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      url: import.meta.env.VITE_INSTAGRAM_URL || '#',
      icon: 'instagram',
    },
    {
      name: 'Facebook',
      url: import.meta.env.VITE_FACEBOOK_URL || '#',
      icon: 'facebook',
    },
    {
      name: 'Spotify',
      url: import.meta.env.VITE_SPOTIFY_URL || '#',
      icon: 'spotify',
    },
    {
      name: 'YouTube',
      url: import.meta.env.VITE_YOUTUBE_URL || '#',
      icon: 'youtube',
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Column 1: Band Info */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>JOCH</h3>
          <p className={styles.tagline}>Ehrliche Musik. Ohne Filter.</p>
          <p className={styles.description}>
            Deutschrock aus Bremen-Nord seit 2022.
            <br />
            Kraftvolle Texte, authentische Bühnenpräsenz.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Links</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/band" className={styles.link}>
                Die Band
              </Link>
            </li>
            <li>
              <Link to="/live" className={styles.link}>
                Konzerte
              </Link>
            </li>
            <li>
              <Link to="/music" className={styles.link}>
                Musik
              </Link>
            </li>
            <li>
              <Link to="/news" className={styles.link}>
                News
              </Link>
            </li>
            <li>
              <Link to="/contact" className={styles.link}>
                Kontakt & Booking
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Social Media */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Social Media</h3>
          <ul className={styles.socialList}>
            {socialLinks.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <span className={styles.socialIcon}>{social.icon[0].toUpperCase()}</span>
                  <span className={styles.socialName}>{social.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p className={styles.copyright}>
            © {currentYear} JOCH. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
