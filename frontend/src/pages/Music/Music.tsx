import { useState, useEffect } from 'react';
import type { Song } from '@joch/shared';
import { songService } from '../../services/song.service';
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './Music.module.scss';

/**
 * Music Page - Display songs with audio player
 *
 * Features:
 * - Hero section
 * - Song list with selection
 * - AudioPlayer for selected song
 * - Lyrics display
 * - Streaming links
 */
export default function Music() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setIsLoading(true);
      const data = await songService.getAll();
      // Sort by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      setSongs(sortedData);

      // Auto-select first song
      if (sortedData.length > 0) {
        setSelectedSong(sortedData[0]);
      }
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Fehler beim Laden der Songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.musicPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Unsere Musik</h1>
          <p className={styles.subtitle}>
            Ehrliche Musik, kraftvolle Texte. Vom echten Leben inspiriert – mal laut, mal
            leise, mal wütend, mal nachdenklich. Sozialkritisch. Direkt. Ohne Filter.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.content}>
        <div className={styles.container}>
          {isLoading ? (
            <div className={styles.loadingWrapper}>
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : songs.length === 0 ? (
            <div className={styles.empty}>
              <p>Noch keine Songs verfügbar.</p>
            </div>
          ) : (
            <div className={styles.musicLayout}>
              {/* Song List */}
              <aside className={styles.songList}>
                <h2 className={styles.sectionTitle}>Tracklist</h2>
                <div className={styles.tracks}>
                  {songs.map((song, index) => (
                    <button
                      key={song._id}
                      className={`${styles.trackItem} ${
                        selectedSong?._id === song._id ? styles.active : ''
                      }`}
                      onClick={() => handleSongSelect(song)}
                    >
                      <span className={styles.trackNumber}>{index + 1}</span>
                      <div className={styles.trackInfo}>
                        <span className={styles.trackTitle}>{song.title}</span>
                        {song.artist && (
                          <span className={styles.trackArtist}>{song.artist}</span>
                        )}
                      </div>
                      <span className={styles.trackDuration}>
                        {formatDuration(song.duration)}
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Audio Player */}
              <main className={styles.playerSection}>
                {selectedSong ? (
                  <AudioPlayer song={selectedSong} key={selectedSong._id} />
                ) : (
                  <div className={styles.noSelection}>
                    <p>Wähle einen Song aus der Tracklist</p>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Hört uns auf euren Lieblingsplattformen</h2>
          <p className={styles.ctaText}>
            Unsere Musik ist überall verfügbar – Spotify, Apple Music, YouTube und mehr.
          </p>
          <div className={styles.ctaButtons}>
            <a
              href={import.meta.env.VITE_SPOTIFY_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButton}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Spotify
            </a>
            <a
              href={import.meta.env.VITE_YOUTUBE_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButton}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}