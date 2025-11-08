// ============================================
// JOCH Bandpage - Gallery Form Component
// Modal form for creating and editing gallery images
// ============================================

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { GalleryImage } from '@joch/shared';
import { galleryService } from '@/services/gallery.service';
import { uploadService } from '@/services/upload.service';
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

  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

      // Set previews if URLs exist
      if (image.imageUrl) {
        setImagePreview(image.imageUrl);
      }
      if (image.thumbnailUrl) {
        setThumbnailPreview(image.thumbnailUrl);
      }
    }
  }, [image]);

  // Handle main image file selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Bitte wähle ein Bild aus (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 10MB for gallery images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Bild ist zu groß (max. 10MB)');
      return;
    }

    setImageFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Bitte wähle ein Bild aus (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 5MB for thumbnails)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Thumbnail ist zu groß (max. 5MB)');
      return;
    }

    setThumbnailFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove main image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailUrl('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation - require either file or existing URL
    if (!imageFile && !imageUrl.trim()) {
      setError('Bitte lade ein Bild hoch');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploading(true);

      // Upload main image to Cloudinary if a new file was selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadResponse = await uploadService.uploadImage(imageFile, token);
        finalImageUrl = uploadResponse.url;
      }

      // Upload thumbnail to Cloudinary if a new file was selected
      let finalThumbnailUrl = thumbnailUrl;
      if (thumbnailFile) {
        const uploadResponse = await uploadService.uploadImage(thumbnailFile, token);
        finalThumbnailUrl = uploadResponse.url;
      }

      setIsUploading(false);

      const imageData: Partial<GalleryImage> = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: finalImageUrl,
        thumbnailUrl: finalThumbnailUrl || undefined,
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
      setIsUploading(false);
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
            {/* Main Image Upload */}
            <div className={styles.formGroupFull}>
              <label htmlFor="mainImage" className={styles.label}>
                Bild * (Hauptbild)
              </label>

              {/* Show upload status */}
              {isUploading && (
                <div className={styles.uploadingMessage}>
                  📤 Bilder werden hochgeladen...
                </div>
              )}

              {/* Show preview if available */}
              {imagePreview && !isUploading && (
                <div className={styles.imagePreview}>
                  <img
                    src={imagePreview}
                    alt="Bild Preview"
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className={styles.removeButton}
                    disabled={isSubmitting}
                  >
                    ✕ Entfernen
                  </button>
                </div>
              )}

              {/* File input */}
              {!imagePreview && !isUploading && (
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="mainImage"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="mainImage" className={styles.fileInputLabel}>
                    📷 Hauptbild auswählen
                  </label>
                  <span className={styles.fileInputHint}>
                    JPG, PNG oder WEBP (max. 10MB)
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className={styles.formGroupFull}>
              <label htmlFor="thumbnail" className={styles.label}>
                Thumbnail (optional)
              </label>

              {/* Show preview if available */}
              {thumbnailPreview && !isUploading && (
                <div className={styles.imagePreview}>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className={styles.previewImageSmall}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className={styles.removeButton}
                    disabled={isSubmitting}
                  >
                    ✕ Entfernen
                  </button>
                </div>
              )}

              {/* File input */}
              {!thumbnailPreview && !isUploading && (
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleThumbnailChange}
                    className={styles.fileInput}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="thumbnail" className={styles.fileInputLabel}>
                    🖼️ Thumbnail auswählen
                  </label>
                  <span className={styles.fileInputHint}>
                    JPG, PNG oder WEBP (max. 5MB)
                  </span>
                </div>
              )}
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