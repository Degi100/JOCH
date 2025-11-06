// ============================================
// JOCH Bandpage - Gallery Form Component
// Modal form for creating and editing gallery images
// ============================================

import { useState, useEffect, FormEvent } from 'react';
import { GalleryImage } from '@joch/shared';
import { galleryService } from '@/services/gallery.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import styles from './GalleryForm.module.scss';

interface GalleryFormProps {
  image: GalleryImage | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GalleryForm({ image, onSuccess, onCancel }: GalleryFormProps) {
  const { token } = useAuth();
  const isEditMode = !!image;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<'live' | 'promo' | 'backstage' | 'other'>('other');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with image data in edit mode
  useEffect(() => {
    if (image) {
      setTitle(image.title ?? '');
      setDescription(image.description ?? '');
      setImageUrl(image.imageUrl);
      setThumbnailUrl(image.thumbnailUrl ?? '');
      setCategory(image.category ?? 'other');
    }
  }, [image]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!imageUrl.trim()) {
      setError('Bitte füge eine Bild-URL hinzu');
      return;
    }

    try {
      setIsSubmitting(true);

      const imageData: Partial<GalleryImage> = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        category,
        order: image?.order ?? 0,
      };

      if (isEditMode && image?._id) {
        await galleryService.update(image._id, imageData, token);
      } else {
        await galleryService.create(imageData, token);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving image:', err);
      setError(err.message || 'Fehler beim Speichern des Bildes');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSubmitting, onCancel]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditMode ? 'Bild bearbeiten' : 'Neues Bild'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.formGrid}>
            {/* Image URL */}
            <div className={styles.formGroupFull}>
              <Input
                label="Bild URL *"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Thumbnail URL */}
            <div className={styles.formGroupFull}>
              <Input
                label="Thumbnail URL (optional)"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <Input
                label="Titel"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Live in Bremen"
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                Kategorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className={styles.select}
                disabled={isSubmitting}
              >
                <option value="live">Live</option>
                <option value="promo">Promo</option>
                <option value="backstage">Backstage</option>
                <option value="other">Andere</option>
              </select>
            </div>

            {/* Description */}
            <div className={styles.formGroupFull}>
              <label htmlFor="description" className={styles.label}>
                Beschreibung
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung des Bildes..."
                className={styles.textarea}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? 'Speichern...'
                  : 'Erstellen...'
                : isEditMode
                ? 'Speichern'
                : 'Erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}