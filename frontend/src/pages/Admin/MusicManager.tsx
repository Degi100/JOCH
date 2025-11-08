// ============================================
// JOCH Bandpage - Admin Music Manager
// CRUD Interface for managing songs
// ============================================

import { useState, useEffect } from 'react';
import { Song } from '@joch/shared';
import { songService } from '@/services/song.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import MusicForm from './components/MusicForm';
import styles from './MusicManager.module.scss';

export default function MusicManager() {
  const { token } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await songService.getAll();
      setSongs(data);
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Fehler beim Laden der Songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSong(null);
    setIsFormOpen(true);
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diesen Song wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um Songs zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await songService.delete(id, token);
      setSongs(songs.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Error deleting song:', err);
      alert('Fehler beim Löschen des Songs');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingSong(null);
    await loadSongs();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingSong(null);
  };

  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString?: Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.musicManagerPage}>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.musicManagerPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <Button onClick={loadSongs}>Erneut versuchen</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.musicManagerPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Musik verwalten</h1>
              <p className={styles.subtitle}>
                Erstelle, bearbeite und lösche Songs
              </p>
            </div>
            <Button variant="primary" onClick={handleCreate}>
              + Neuer Song
            </Button>
          </div>
        </div>

        {/* Songs List */}
        {songs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎵</div>
            <h2 className={styles.emptyTitle}>Noch keine Songs vorhanden</h2>
            <p className={styles.emptyText}>
              Füge deinen ersten Song hinzu, um deine Musik mit deinen Fans zu teilen.
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + Ersten Song hinzufügen
            </Button>
          </div>
        ) : (
          <div className={styles.songsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>Titel</div>
              <div className={styles.headerCell}>Album</div>
              <div className={styles.headerCell}>Dauer</div>
              <div className={styles.headerCell}>Release</div>
              <div className={styles.headerCell}>Aktionen</div>
            </div>

            <div className={styles.tableBody}>
              {songs.map((song) => (
                <div key={song._id} className={styles.tableRow}>
                  <div className={styles.cell}>
                    <div className={styles.songCell}>
                      <span className={styles.songTitle}>{song.title}</span>
                      {song.artist && (
                        <span className={styles.songArtist}>{song.artist}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.mobileLabel}>Album</div>
                    <span className={styles.album}>{song.album || '-'}</span>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.mobileLabel}>Dauer</div>
                    <span className={styles.duration}>{formatDuration(song.duration)}</span>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.mobileLabel}>Release</div>
                    <span className={styles.date}>{formatDate(song.releaseDate)}</span>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.actions}>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleEdit(song)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDelete(song._id!)}
                        isLoading={deletingId === song._id}
                        disabled={deletingId === song._id}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <MusicForm
          song={editingSong}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}