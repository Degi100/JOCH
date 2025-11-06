// ============================================
// JOCH Bandpage - Band Member Form Component
// Modal form for creating and editing band members
// ============================================

import { useState, useEffect, FormEvent } from 'react';
import { BandMember } from '@joch/shared';
import { bandService } from '@/services/band.service';
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

  // Initialize form with member data in edit mode
  useEffect(() => {
    if (member) {
      setName(member.name);
      setInstrument(member.instrument);
      setRole(member.role ?? '');
      setBio(member.bio);
      setImage(member.image ?? member.photo ?? '');
      setInstagram(member.instagram ?? '');
      setFacebook(member.facebook ?? '');
      setTwitter(member.twitter ?? '');
    }
  }, [member]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!name.trim() || !instrument.trim() || !bio.trim() || !image.trim()) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    try {
      setIsSubmitting(true);

      const memberData: Partial<BandMember> = {
        name: name.trim(),
        instrument: instrument.trim(),
        role: role.trim() || undefined,
        bio: bio.trim(),
        image: image.trim(),
        photo: image.trim(), // Also set alias
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

            {/* Image URL */}
            <div className={styles.formGroupFull}>
              <Input
                label="Bild URL *"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Bio */}
            <div className={styles.formGroupFull}>
              <label htmlFor="bio" className={styles.label}>
                Bio *
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Beschreibung des Bandmitglieds..."
                className={styles.textarea}
                rows={6}
                disabled={isSubmitting}
                required
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