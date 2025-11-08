// ============================================
// JOCH Bandpage - Music Form Component
// Modal form for creating and editing songs
// ============================================

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Song } from '@joch/shared';
import { songService } from '@/services/song.service';
import { uploadService } from '@/services/upload.service';
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
  const [isUploading, setIsUploading] = useState(false);
  const [audioFileObj, setAudioFileObj] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  // Initialize form with song data in edit mode
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist ?? '');
      setAlbum(song.album ?? '');
      setDuration(song.duration.toString());
      setAudioFile(song.audioFile ?? song.audioUrl ?? '');
      const existingCover = song.coverArt ?? '';
      setCoverArt(existingCover);
      setCoverImagePreview(existingCover);
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

  // Handle audio file selection
  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      setError('Bitte wähle eine Audio-Datei aus (MP3, WAV, OGG)');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('Audio-Datei ist zu groß (max. 50MB)');
      return;
    }

    setAudioFileObj(file);
    setError(null);

    // Extract audio duration automatically
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      const durationInSeconds = Math.round(audio.duration);
      setDuration(durationInSeconds.toString());
      URL.revokeObjectURL(objectUrl);
    });

    audio.addEventListener('error', () => {
      console.error('Error loading audio metadata');
      URL.revokeObjectURL(objectUrl);
    });

    audio.src = objectUrl;
  };

  // Remove selected audio
  const handleRemoveAudio = () => {
    setAudioFileObj(null);
    setAudioFile(song?.audioFile ?? song?.audioUrl ?? '');
  };

  // Handle cover image selection
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    setCoverImageFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected cover image
  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(song?.coverArt ?? null);
    setCoverArt(song?.coverArt ?? '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Du musst eingeloggt sein');
      return;
    }

    // Basic validation
    if (!title.trim() || !duration) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    // Check if audio is provided (only file upload now)
    if (!audioFileObj && !audioFile.trim()) {
      setError('Bitte lade eine Audio-Datei hoch');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Dauer muss eine positive Zahl sein');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploading(true);

      let audioUrl = audioFile.trim();
      let coverUrl = coverArt.trim();

      // Upload audio to Cloudinary
      if (audioFileObj) {
        try {
          const uploadResponse = await uploadService.uploadAudio(audioFileObj, token);
          audioUrl = uploadResponse.url;
        } catch (uploadErr: any) {
          console.error('Error uploading audio:', uploadErr);
          setError('Fehler beim Hochladen der Audio-Datei: ' + uploadErr.message);
          setIsUploading(false);
          return;
        }
      }

      // Upload cover image to Cloudinary (optional)
      if (coverImageFile) {
        try {
          const uploadResponse = await uploadService.uploadImage(coverImageFile, token);
          coverUrl = uploadResponse.url;
        } catch (uploadErr: any) {
          console.error('Error uploading cover image:', uploadErr);
          setError('Fehler beim Hochladen des Cover-Bildes: ' + uploadErr.message);
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);

      const songData: Partial<Song> = {
        title: title.trim(),
        artist: artist.trim() || undefined,
        album: album.trim() || undefined,
        duration: durationNum,
        audioFile: audioUrl,
        audioUrl: audioUrl, // Also set alias
        coverArt: coverUrl || undefined,
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

      console.log('📤 Sending to backend:', songData);

      let response;
      if (isEditMode && song?._id) {
        response = await songService.update(song._id, songData, token);
      } else {
        response = await songService.create(songData, token);
      }

      console.log('📥 Received from backend:', response);

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

            {/* Duration - Auto-detected from audio file */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Dauer *</label>
              <div className={styles.durationDisplay}>
                {duration ? (
                  <>
                    <span className={styles.durationTime}>
                      {Math.floor(parseInt(duration) / 60)}:{(parseInt(duration) % 60).toString().padStart(2, '0')}
                    </span>
                    <span className={styles.durationSeconds}>({duration} Sekunden)</span>
                  </>
                ) : (
                  <span className={styles.durationPlaceholder}>
                    Wird automatisch erkannt beim Hochladen
                  </span>
                )}
              </div>
            </div>

            {/* Audio File Upload */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>Audio-Datei * (MP3, WAV, OGG)</label>

              {/* Show current file if exists */}
              {audioFile && !audioFileObj && (
                <div className={styles.audioPreview}>
                  <div className={styles.audioInfo}>
                    <span className={styles.audioIcon}>🎵</span>
                    <span className={styles.audioName}>Aktuell: {audioFile.split('/').pop()}</span>
                  </div>
                </div>
              )}

              {/* Show selected file */}
              {audioFileObj && (
                <div className={styles.audioPreview}>
                  <div className={styles.audioInfo}>
                    <span className={styles.audioIcon}>🎵</span>
                    <span className={styles.audioName}>{audioFileObj.name}</span>
                    <span className={styles.audioSize}>
                      {(audioFileObj.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAudio}
                    className={styles.removeAudioButton}
                    disabled={isSubmitting}
                  >
                    ✕ Entfernen
                  </button>
                </div>
              )}

              {/* File Input */}
              <div className={styles.fileInputWrapper}>
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                  onChange={handleAudioChange}
                  className={styles.fileInput}
                  disabled={isSubmitting || isUploading}
                />
                <label htmlFor="audio-upload" className={styles.fileInputLabel}>
                  {audioFileObj ? 'Andere Datei wählen' : 'Audio-Datei auswählen (max. 50MB)'}
                </label>
              </div>
            </div>

            {/* Cover Art Upload (optional) */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>Cover Art (optional)</label>

              {/* Preview */}
              {coverImagePreview && (
                <div className={styles.imagePreview}>
                  <img src={coverImagePreview} alt="Cover Preview" className={styles.previewImage} />
                  {coverImageFile && (
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
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
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className={styles.fileInput}
                  disabled={isSubmitting || isUploading}
                />
                <label htmlFor="cover-upload" className={styles.fileInputLabel}>
                  {coverImageFile ? coverImageFile.name : 'Cover-Bild auswählen (max. 10MB)'}
                </label>
              </div>
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
              {isUploading
                ? 'Dateien werden hochgeladen...'
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