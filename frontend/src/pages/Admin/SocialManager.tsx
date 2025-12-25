// ============================================
// JOCH Bandpage - Admin Social Links Manager
// Interface for managing social media links
// ============================================

import { useState, useEffect } from 'react';
import type { SocialLink } from '@joch/shared';
import { socialLinkService } from '@/services/socialLink.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './SocialManager.module.scss';

type Platform = SocialLink['platform'];

const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
  { value: 'youtube', label: 'YouTube', icon: '🎬' },
  { value: 'spotify', label: 'Spotify', icon: '🎵' },
  { value: 'tiktok', label: 'TikTok', icon: '📱' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'soundcloud', label: 'SoundCloud', icon: '☁️' },
  { value: 'bandcamp', label: 'Bandcamp', icon: '💿' },
  { value: 'other', label: 'Andere', icon: '🔗' },
];

interface FormData {
  platform: Platform;
  url: string;
  label: string;
  active: boolean;
}

const initialFormData: FormData = {
  platform: 'instagram',
  url: '',
  label: '',
  active: true,
};

export default function SocialManager() {
  const { token } = useAuth();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await socialLinkService.getAll(true);
      setLinks(data);
    } catch (err) {
      console.error('Error loading social links:', err);
      setError('Fehler beim Laden der Social Links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.url.trim()) {
      alert('URL ist erforderlich');
      return;
    }

    try {
      setIsSaving(true);

      if (editingId) {
        const updated = await socialLinkService.update(editingId, formData, token);
        setLinks(links.map((l) => (l._id === editingId ? updated : l)));
      } else {
        const created = await socialLinkService.create(
          { ...formData, order: links.length },
          token
        );
        setLinks([...links, created]);
      }

      resetForm();
    } catch (err) {
      console.error('Error saving social link:', err);
      alert('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link._id);
    setFormData({
      platform: link.platform,
      url: link.url,
      label: link.label || '',
      active: link.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diesen Link wirklich löschen?')) {
      return;
    }

    if (!token) return;

    try {
      setDeletingId(id);
      await socialLinkService.delete(id, token);
      setLinks(links.filter((l) => l._id !== id));
    } catch (err) {
      console.error('Error deleting social link:', err);
      alert('Fehler beim Löschen');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (link: SocialLink) => {
    if (!token) return;

    try {
      const updated = await socialLinkService.update(
        link._id,
        { active: !link.active },
        token
      );
      setLinks(links.map((l) => (l._id === link._id ? updated : l)));
    } catch (err) {
      console.error('Error toggling active:', err);
      alert('Fehler beim Aktualisieren');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  const getPlatformInfo = (platform: Platform) => {
    return PLATFORMS.find((p) => p.value === platform) || PLATFORMS[8];
  };

  return (
    <div className={styles.socialManager}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Social Media Links</h1>
          <p className={styles.subtitle}>
            Verwalte die Social Media Links für die Website
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Neuer Link
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.formTitle}>
            {editingId ? 'Link bearbeiten' : 'Neuer Link'}
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Plattform</label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value as Platform })
                }
                className={styles.select}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <Input
                label="URL *"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://instagram.com/joch_band"
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Label (optional)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="z.B. JOCH auf Instagram"
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  disabled={isSaving}
                />
                <span>Aktiv (auf Website anzeigen)</span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Speichern...' : editingId ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      )}

      {/* Links List */}
      {isLoading ? (
        <LoadingSpinner size="large" centered message="Lade Links..." />
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button onClick={loadLinks} variant="primary">
            Erneut versuchen
          </Button>
        </div>
      ) : links.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔗</span>
          <p>Keine Social Links vorhanden.</p>
          <p className={styles.emptyHint}>
            Füge deinen ersten Social Media Link hinzu!
          </p>
        </div>
      ) : (
        <div className={styles.linksList}>
          <div className={styles.listHeader}>
            <p>{links.length} Links</p>
          </div>

          {links.map((link) => {
            const platformInfo = getPlatformInfo(link.platform);
            return (
              <div
                key={link._id}
                className={`${styles.linkCard} ${!link.active ? styles.inactive : ''}`}
              >
                <div className={styles.linkMain}>
                  <div className={styles.linkIcon}>{platformInfo.icon}</div>
                  <div className={styles.linkInfo}>
                    <div className={styles.linkPlatform}>
                      {platformInfo.label}
                      {!link.active && (
                        <span className={styles.inactiveBadge}>Inaktiv</span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkUrl}
                    >
                      {link.url}
                    </a>
                    {link.label && (
                      <div className={styles.linkLabel}>{link.label}</div>
                    )}
                  </div>
                </div>

                <div className={styles.linkActions}>
                  <Button
                    variant="secondary"
                    onClick={() => handleToggleActive(link)}
                  >
                    {link.active ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                  <Button variant="secondary" onClick={() => handleEdit(link)}>
                    Bearbeiten
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(link._id)}
                    disabled={deletingId === link._id}
                  >
                    {deletingId === link._id ? 'Löschen...' : 'Löschen'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
