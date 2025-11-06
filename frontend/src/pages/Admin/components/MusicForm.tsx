// ============================================
// JOCH Bandpage - Music Form Component
// Modal form for creating and editing songs
// ============================================

import { useState, useEffect, FormEvent } from 'react';
import { Song } from '@joch/shared';
import { songService } from '@/services/song.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import styles from './MusicForm.module.scss';

interface MusicFormProps {
  song: Song | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MusicForm({ song, onSuccess, onCancel }: MusicFormProps) {
  const { token } = useAuth();
  const isEditMode = !!song;

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState('');
  const [coverArt, setCoverArt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [spotify, setSpotify] = useState('');
  const [appleMusic, setAppleMusic] = useState('');
  const [youtube, setYoutube] = useState('');
  const [soundcloud, setSoundcloud] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with song data in edit mode
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist ?? '');
      setAlbum(song.album ?? '');
      setDuration(song.duration.toString());
      setAudioFile(song.audioFile ?? song.audioUrl ?? '');
      setCoverArt(song.coverArt ?? '');
      setLyrics(song.lyrics ?? '');
      if (song.releaseDate) {
        const date = new Date(song.releaseDate);
        setReleaseDate(date.toISOString().split('T')[0]);
      }
      setSpotify(song.streamingLinks?.spotify ?? '');
      setAppleMusic(song.streamingLinks?.appleMusic ?? '');
      setYoutube(song.streamingLinks?.youtube ?? '');
      setSoundcloud(song.streamingLinks?.soundcloud ?? '');
    }
  }, [song]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!title.trim() || !duration || !audioFile.trim()) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Dauer muss eine positive Zahl sein');
      return;
    }

    try {
      setIsSubmitting(true);

      const songData: Partial<Song> = {
        title: title.trim(),
        artist: artist.trim() || undefined,
        album: album.trim() || undefined,
        duration: durationNum,
        audioFile: audioFile.trim(),
        audioUrl: audioFile.trim(), // Also set alias
        coverArt: coverArt.trim() || undefined,
        lyrics: lyrics.trim() || undefined,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        streamingLinks: {
          spotify: spotify.trim() || undefined,
          appleMusic: appleMusic.trim() || undefined,
          youtube: youtube.trim() || undefined,
          soundcloud: soundcloud.trim() || undefined,
        },
        order: song?.order ?? 0,
      };

      if (isEditMode && song?._id) {
        await songService.update(song._id, songData, token);
      } else {
        await songService.create(songData, token);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving song:', err);
      setError(err.message || 'Fehler beim Speichern des Songs');
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
            {isEditMode ? 'Song bearbeiten' : 'Neuer Song'}
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
                label="Titel *"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Gegen den Strom"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Artist */}
            <div className={styles.formGroup}>
              <Input
                label="Artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="z.B. JOCH"
                disabled={isSubmitting}
              />
            </div>

            {/* Album */}
            <div className={styles.formGroup}>
              <Input
                label="Album"
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="z.B. Debütalbum"
                disabled={isSubmitting}
              />
            </div>

            {/* Duration */}
            <div className={styles.formGroup}>
              <Input
                label="Dauer (Sekunden) *"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="z.B. 240"
                min="1"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Audio File */}
            <div className={styles.formGroupFull}>
              <Input
                label="Audio Datei URL *"
                type="url"
                value={audioFile}
                onChange={(e) => setAudioFile(e.target.value)}
                placeholder="https://..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Cover Art */}
            <div className={styles.formGroupFull}>
              <Input
                label="Cover Art URL"
                type="url"
                value={coverArt}
                onChange={(e) => setCoverArt(e.target.value)}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            {/* Release Date */}
            <div className={styles.formGroupFull}>
              <Input
                label="Release Datum"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Streaming Links */}
            <div className={styles.formGroupFull}>
              <h3 className={styles.sectionTitle}>Streaming Links</h3>
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Spotify"
                type="url"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="https://open.spotify.com/..."
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Apple Music"
                type="url"
                value={appleMusic}
                onChange={(e) => setAppleMusic(e.target.value)}
                placeholder="https://music.apple.com/..."
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="YouTube"
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="SoundCloud"
                type="url"
                value={soundcloud}
                onChange={(e) => setSoundcloud(e.target.value)}
                placeholder="https://soundcloud.com/..."
                disabled={isSubmitting}
              />
            </div>

            {/* Lyrics */}
            <div className={styles.formGroupFull}>
              <label htmlFor="lyrics" className={styles.label}>
                Lyrics
              </label>
              <textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Liedtext hier eingeben..."
                className={styles.textarea}
                rows={10}
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