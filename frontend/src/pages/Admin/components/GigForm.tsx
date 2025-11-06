// ============================================
// JOCH Bandpage - Gig Form Component
// Modal form for creating and editing gigs
// ============================================

import { useState, useEffect, FormEvent } from 'react';
import { Gig } from '@joch/shared';
import { gigService } from '@/services/gig.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import styles from './GigForm.module.scss';

interface GigFormProps {
  gig: Gig | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GigForm({ gig, onSuccess, onCancel }: GigFormProps) {
  const { token } = useAuth();
  const isEditMode = !!gig;

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [ticketLink, setTicketLink] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with gig data in edit mode
  useEffect(() => {
    if (gig) {
      setTitle(gig.title);
      // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
      const gigDate = new Date(gig.date);
      const localDate = new Date(gigDate.getTime() - gigDate.getTimezoneOffset() * 60000);
      setDate(localDate.toISOString().slice(0, 16));
      setVenue(gig.venue);
      setCity(gig.city ?? gig.location ?? '');
      setDescription(gig.description ?? '');
      setTicketLink(gig.ticketLink ?? '');
      setPrice(gig.price ?? '');
      setStatus(gig.status);
    }
  }, [gig]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!title.trim() || !date || !venue.trim() || !city.trim()) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    try {
      setIsSubmitting(true);

      const gigData: Partial<Gig> = {
        title: title.trim(),
        date: new Date(date),
        venue: venue.trim(),
        city: city.trim(),
        location: city.trim(), // Also set location as it's the main field
        description: description.trim() || undefined,
        ticketLink: ticketLink.trim() || undefined,
        price: price.trim() || undefined,
        status,
      };

      if (isEditMode && gig?._id) {
        await gigService.update(gig._id, gigData, token);
      } else {
        await gigService.create(gigData, token);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving gig:', err);
      setError(err.message || 'Fehler beim Speichern des Gigs');
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
            {isEditMode ? 'Gig bearbeiten' : 'Neuer Gig'}
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
            <div className={styles.formGroup}>
              <Input
                label="Event Name *"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. JOCH Live im Kulturzentrum"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Date */}
            <div className={styles.formGroup}>
              <Input
                label="Datum & Uhrzeit *"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Venue */}
            <div className={styles.formGroup}>
              <Input
                label="Venue *"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="z.B. Kulturzentrum Lagerhaus"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* City */}
            <div className={styles.formGroup}>
              <Input
                label="Stadt *"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="z.B. Bremen"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>
                Status *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={styles.select}
                disabled={isSubmitting}
                required
              >
                <option value="upcoming">Anstehend</option>
                <option value="past">Vergangen</option>
                <option value="cancelled">Abgesagt</option>
              </select>
            </div>

            {/* Price */}
            <div className={styles.formGroup}>
              <Input
                label="Eintrittspreis (€)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="z.B. 15"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Ticket Link */}
            <div className={styles.formGroupFull}>
              <Input
                label="Ticket Link"
                type="url"
                value={ticketLink}
                onChange={(e) => setTicketLink(e.target.value)}
                placeholder="https://..."
                disabled={isSubmitting}
              />
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
                placeholder="Zusätzliche Informationen zum Gig..."
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