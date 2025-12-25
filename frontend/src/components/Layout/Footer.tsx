// ============================================
// JOCH Bandpage - Footer Component
// 3-column footer with info, links, and social media
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { SocialLink } from '@joch/shared';
import { socialLinkService } from '../../services/socialLink.service';
import styles from './Footer.module.scss';

const PLATFORM_ICONS: Record<SocialLink['platform'], string> = {
  instagram: 'IG',
  facebook: 'FB',
  youtube: 'YT',
  spotify: 'SP',
  tiktok: 'TT',
  twitter: 'X',
  soundcloud: 'SC',
  bandcamp: 'BC',
  other: '🔗',
};

const PLATFORM_NAMES: Record<SocialLink['platform'], string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  spotify: 'Spotify',
  tiktok: 'TikTok',
  twitter: 'Twitter/X',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  other: 'Link',
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        const links = await socialLinkService.getAll();
        setSocialLinks(links);
      } catch (err) {
        console.error('Error loading social links:', err);
      }
    };
    loadSocialLinks();
  }, []);

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

        {/* Column 3: Social Media (only if links exist) */}
        {socialLinks.length > 0 && (
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Social Media</h3>
            <ul className={styles.socialList}>
              {socialLinks.map((link) => (
                <li key={link._id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <span className={styles.socialIcon}>
                      {PLATFORM_ICONS[link.platform]}
                    </span>
                    <span className={styles.socialName}>
                      {link.label || PLATFORM_NAMES[link.platform]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
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
