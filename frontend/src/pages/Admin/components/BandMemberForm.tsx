// ============================================
// JOCH Bandpage - Band Member Form Component
// Modal form for creating and editing band members
// ============================================

import { useState, useEffect, useRef, useCallback, FormEvent, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { BandMember } from '@joch/shared';
import { bandService } from '@/services/band.service';
import { uploadService } from '@/services/upload.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import styles from './BandMemberForm.module.scss';

interface BandMemberFormProps {
  member: BandMember | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BandMemberForm({ member, onSuccess, onCancel }: BandMemberFormProps) {
  const { token } = useAuth();
  const isEditMode = !!member;

  // Form state
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePositionX, setImagePositionX] = useState(50); // 0-100%
  const [imagePositionY, setImagePositionY] = useState(50); // 0-100%
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(1); // height/width ratio
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPositionX = useRef(50);
  const dragStartPositionY = useRef(50);
  const resizeStartScale = useRef(1);
  const resizeStartDistance = useRef(0);

  // Drag handlers for image positioning
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isSubmitting || isResizing) return;
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragStartPositionX.current = imagePositionX;
    dragStartPositionY.current = imagePositionY;
  }, [isSubmitting, isResizing, imagePositionX, imagePositionY]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isResizing) return;
    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;
    // Calculate max offset based on current scale and aspect ratio
    const imageWidth = 250 * imageScale;
    const imageHeight = imageWidth * imageAspectRatio;
    const circleSize = 200;
    const maxOffsetX = Math.max(0, (imageWidth - circleSize) / 2);
    const maxOffsetY = Math.max(0, (imageHeight - circleSize) / 2);
    // Fixed sensitivity: 0.4 position units per pixel (feels natural)
    const sensitivity = 0.4;
    // Horizontal movement
    if (maxOffsetX > 0) {
      const newPositionX = Math.max(0, Math.min(100, dragStartPositionX.current - deltaX * sensitivity));
      setImagePositionX(newPositionX);
    }
    // Vertical movement
    if (maxOffsetY > 0) {
      const newPositionY = Math.max(0, Math.min(100, dragStartPositionY.current - deltaY * sensitivity));
      setImagePositionY(newPositionY);
    }
  }, [isDragging, isResizing, imageScale, imageAspectRatio]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Resize handlers for corner handles
  const handleResizeStart = useCallback((e: MouseEvent | TouchEvent, _corner: string) => {
    e.stopPropagation();
    if (isSubmitting) return;
    setIsResizing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    resizeStartScale.current = imageScale;
    // Calculate distance from center for reference
    resizeStartDistance.current = Math.sqrt(clientX * clientX + clientY * clientY);
  }, [isSubmitting, imageScale]);

  const handleResizeMove = useCallback((clientX: number, clientY: number) => {
    if (!isResizing) return;
    // Calculate how far we've dragged from start
    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;
    // Use diagonal distance for scaling (positive = bigger, negative = smaller)
    const dragDistance = (deltaX + deltaY) / 2;
    // Sensitivity: 100px drag = 1.0 scale change
    const scaleChange = dragDistance / 100;
    const newScale = Math.max(0.8, Math.min(3, resizeStartScale.current + scaleChange));
    setImageScale(newScale);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
    handleResizeMove(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    handleDragEnd();
    handleResizeEnd();
  };
  const handleMouseLeave = () => {
    handleDragEnd();
    handleResizeEnd();
  };

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e: TouchEvent) => {
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    handleResizeMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = () => {
    handleDragEnd();
    handleResizeEnd();
  };

  // Initialize form with member data in edit mode
  useEffect(() => {
    if (member) {
      setName(member.name);
      setInstrument(member.instrument);
      setRole(member.role ?? '');
      setBio(member.bio);
      const existingImage = member.image ?? member.photo ?? '';
      setImage(existingImage);
      setImagePreview(existingImage);
      setInstagram(member.instagram ?? '');
      setFacebook(member.facebook ?? '');
      setTwitter(member.twitter ?? '');
      setImageScale(member.imageScale ?? 1);
      setImagePositionX(member.imagePositionX ?? 50);
      setImagePositionY(member.imagePositionY ?? 50);
      setImageAspectRatio(member.imageAspectRatio ?? 1);
    }
  }, [member]);

  // Handle image file selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wähle eine Bilddatei aus');
      return;
    }

    // Validate file size (max 10MB)
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

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(member?.image ?? member?.photo ?? null);
    setImage(member?.image ?? member?.photo ?? '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!name.trim() || !instrument.trim()) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    // Check if image is provided (only file upload now)
    if (!imageFile && !image.trim()) {
      setError('Bitte lade ein Bild hoch');
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = image.trim();

      // Upload image to server
      if (imageFile) {
        setIsUploading(true);
        try {
          const uploadResponse = await uploadService.uploadImage(imageFile, token);
          imageUrl = uploadResponse.url;
        } catch (uploadErr: any) {
          console.error('Error uploading image:', uploadErr);
          setError('Fehler beim Hochladen des Bildes: ' + uploadErr.message);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const memberData: Partial<BandMember> = {
        name: name.trim(),
        instrument: instrument.trim(),
        role: role.trim() || undefined,
        bio: bio.trim() || '',
        image: imageUrl,
        photo: imageUrl, // Also set alias
        imageScale,
        imagePositionX,
        imagePositionY,
        imageAspectRatio,
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        twitter: twitter.trim() || undefined,
        order: member?.order ?? 0,
      };

      if (isEditMode && member?._id) {
        await bandService.update(member._id, memberData, token);
      } else {
        await bandService.create(memberData, token);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving band member:', err);
      setError(err.message || 'Fehler beim Speichern des Bandmitglieds');
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
            {isEditMode ? 'Mitglied bearbeiten' : 'Neues Mitglied'}
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
            {/* Name */}
            <div className={styles.formGroup}>
              <Input
                label="Name *"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Max Mustermann"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Instrument */}
            <div className={styles.formGroup}>
              <Input
                label="Instrument *"
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="z.B. Gitarre"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Role */}
            <div className={styles.formGroupFull}>
              <Input
                label="Rolle (optional)"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="z.B. Lead Vocals, Rhythmusgitarre"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Upload */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>Bild *</label>

              {/* Facebook-style Image Editor */}
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <div
                    className={`${styles.editorContainer} ${isDragging ? styles.dragging : ''} ${isResizing ? styles.resizing : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {(() => {
                      // Calculate image size and position offset
                      const imageWidth = 250 * imageScale;
                      const imageHeight = imageWidth * imageAspectRatio;
                      const circleSize = 200;
                      // Offset range based on how much image extends beyond circle
                      const maxOffsetX = Math.max(0, (imageWidth - circleSize) / 2);
                      const maxOffsetY = Math.max(0, (imageHeight - circleSize) / 2);
                      const offsetX = ((50 - imagePositionX) / 50) * maxOffsetX;
                      const offsetY = ((50 - imagePositionY) / 50) * maxOffsetY;
                      return (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className={styles.previewImage}
                          style={{
                            width: `${imageWidth}px`,
                            transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                          }}
                          draggable={false}
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            if (img.naturalWidth > 0) {
                              setImageAspectRatio(img.naturalHeight / img.naturalWidth);
                            }
                          }}
                        />
                      );
                    })()}
                    <div className={styles.circleOverlay} />
                    {/* Corner resize handles */}
                    <div
                      className={`${styles.resizeHandle} ${styles.topLeft}`}
                      onMouseDown={(e) => handleResizeStart(e, 'topLeft')}
                      onTouchStart={(e) => handleResizeStart(e, 'topLeft')}
                    />
                    <div
                      className={`${styles.resizeHandle} ${styles.topRight}`}
                      onMouseDown={(e) => handleResizeStart(e, 'topRight')}
                      onTouchStart={(e) => handleResizeStart(e, 'topRight')}
                    />
                    <div
                      className={`${styles.resizeHandle} ${styles.bottomLeft}`}
                      onMouseDown={(e) => handleResizeStart(e, 'bottomLeft')}
                      onTouchStart={(e) => handleResizeStart(e, 'bottomLeft')}
                    />
                    <div
                      className={`${styles.resizeHandle} ${styles.bottomRight}`}
                      onMouseDown={(e) => handleResizeStart(e, 'bottomRight')}
                      onTouchStart={(e) => handleResizeStart(e, 'bottomRight')}
                    />
                  </div>
                  <p className={styles.editorHint}>Bild ziehen zum Verschieben • Ecken zum Zoomen</p>

                  {/* Controls */}
                  <div className={styles.imageControls}>
                    {/* Zoom Slider */}
                    <div className={styles.controlRow}>
                      <span className={styles.controlLabel}>Zoom:</span>
                      <input
                        type="range"
                        min="0.8"
                        max="3"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(parseFloat(e.target.value))}
                        className={styles.controlSlider}
                        disabled={isSubmitting}
                      />
                      <span className={styles.controlValue}>{Math.round(imageScale * 100)}%</span>
                    </div>

                    {/* Position Slider */}
                    <div className={styles.controlRow}>
                      <span className={styles.controlLabel}>Position:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={imagePositionX}
                        onChange={(e) => setImagePositionX(parseInt(e.target.value))}
                        className={styles.controlSlider}
                        disabled={isSubmitting}
                      />
                      <span className={styles.controlValue}>
                        {imagePositionX < 50 ? '← ' : imagePositionX > 50 ? ' →' : '⊙'}
                      </span>
                    </div>
                  </div>

                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={styles.removeImageButton}
                      disabled={isSubmitting}
                    >
                      ✕ Bild entfernen
                    </button>
                  )}
                </div>
              )}

              {/* File Input */}
              <div className={styles.fileInputWrapper}>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  disabled={isSubmitting || isUploading}
                />
                <label htmlFor="image-upload" className={styles.fileInputLabel}>
                  {imageFile ? imageFile.name : 'Bild auswählen oder hier ablegen'}
                </label>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.formGroupFull}>
              <label htmlFor="bio" className={styles.label}>
                Bio (optional)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Beschreibung des Bandmitglieds..."
                className={styles.textarea}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Social Media */}
            <div className={styles.formGroupFull}>
              <h3 className={styles.sectionTitle}>Social Media (optional)</h3>
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Facebook"
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Twitter"
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
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
              {isUploading
                ? 'Bild wird hochgeladen...'
                : isSubmitting
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