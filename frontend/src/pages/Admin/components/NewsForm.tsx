// ============================================
// JOCH Bandpage - News Form Component
// Modal form for creating and editing news posts
// ============================================

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { NewsPost } from '@joch/shared';
import { newsService } from '@/services/news.service';
import { uploadService } from '@/services/upload.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import styles from './NewsForm.module.scss';

interface NewsFormProps {
  newsPost: NewsPost | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewsForm({ newsPost, onSuccess, onCancel }: NewsFormProps) {
  const { token } = useAuth();
  const isEditMode = !!newsPost;

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);

  // File upload state
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with news data in edit mode
  useEffect(() => {
    if (newsPost) {
      setTitle(newsPost.title);
      setExcerpt(newsPost.excerpt);
      setContent(newsPost.content);
      const existingCoverImage = newsPost.coverImage ?? newsPost.featuredImage ?? '';
      setCoverImage(existingCoverImage);
      if (existingCoverImage) {
        setCoverImagePreview(existingCoverImage);
      }
      setPublished(newsPost.published);
    }
  }, [newsPost]);

  // Handle cover image file selection
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Bitte wähle ein Bild aus (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Bild ist zu groß (max. 5MB)');
      return;
    }

    setCoverImageFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove cover image
  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setCoverImage('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploading(true);

      // Upload cover image to Cloudinary if a new file was selected
      let coverImageUrl = coverImage;
      if (coverImageFile) {
        const uploadResponse = await uploadService.uploadImage(coverImageFile, token);
        coverImageUrl = uploadResponse.url;
      }

      setIsUploading(false);

      const newsData: Partial<NewsPost> = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImageUrl || undefined,
        featuredImage: coverImageUrl || undefined, // Also set alias
        published,
      };

      if (isEditMode && newsPost?._id) {
        await newsService.update(newsPost._id, newsData, token);
      } else {
        await newsService.create(newsData, token);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving news:', err);
      setError(err.message || 'Fehler beim Speichern des News-Posts');
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
            {isEditMode ? 'Post bearbeiten' : 'Neuer Post'}
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
            {/* Title */}
            <div className={styles.formGroupFull}>
              <Input
                label="Titel *"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. JOCH Live im Kulturzentrum - Ein unvergesslicher Abend"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Excerpt */}
            <div className={styles.formGroupFull}>
              <label htmlFor="excerpt" className={styles.label}>
                Auszug / Kurzbeschreibung *
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Kurze Zusammenfassung des Posts (max. 200 Zeichen)..."
                className={styles.textarea}
                rows={3}
                disabled={isSubmitting}
                required
                maxLength={200}
              />
              <span className={styles.charCount}>
                {excerpt.length} / 200 Zeichen
              </span>
            </div>

            {/* Content */}
            <div className={styles.formGroupFull}>
              <label htmlFor="content" className={styles.label}>
                Inhalt *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Der vollständige Text des News-Posts..."
                className={styles.textarea}
                rows={12}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Cover Image Upload */}
            <div className={styles.formGroupFull}>
              <label htmlFor="coverImage" className={styles.label}>
                Cover Bild
              </label>

              {/* Show upload status */}
              {isUploading && (
                <div className={styles.uploadingMessage}>
                  📤 Bild wird hochgeladen...
                </div>
              )}

              {/* Show preview if available */}
              {coverImagePreview && !isUploading && (
                <div className={styles.imagePreview}>
                  <img
                    src={coverImagePreview}
                    alt="Cover Preview"
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className={styles.removeButton}
                    disabled={isSubmitting}
                  >
                    ✕ Entfernen
                  </button>
                </div>
              )}

              {/* File input */}
              {!coverImagePreview && !isUploading && (
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="coverImage"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverImageChange}
                    className={styles.fileInput}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="coverImage" className={styles.fileInputLabel}>
                    📷 Bild auswählen
                  </label>
                  <span className={styles.fileInputHint}>
                    JPG, PNG oder WEBP (max. 5MB)
                  </span>
                </div>
              )}
            </div>

            {/* Published Checkbox */}
            <div className={styles.formGroupFull}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  disabled={isSubmitting}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Sofort veröffentlichen
                  {!published && (
                    <span className={styles.hint}> (als Entwurf speichern)</span>
                  )}
                </span>
              </label>
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