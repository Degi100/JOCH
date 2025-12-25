import { useState } from 'react';
import type { Song } from '@joch/shared';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import Equalizer from '../Equalizer/Equalizer';
import styles from './AudioPlayer.module.scss';

/**
 * AudioPlayer component props
 */
interface AudioPlayerProps {
  /**
   * Song to display
   */
  song: Song;
}

/**
 * AudioPlayer - Song detail view with visualization
 *
 * Features:
 * - Cover art display (spinning vinyl)
 * - Equalizer visualization
 * - Lyrics display toggle
 * - Streaming links
 *
 * Controls are handled by the MiniPlayer in the bottom bar.
 */
export default function AudioPlayer({ song }: AudioPlayerProps) {
  const { isPlaying, currentSong } = useAudioPlayer();

  const [showLyrics, setShowLyrics] = useState(false);

  // Check if this song is the currently playing song
  const isCurrentSong = currentSong?._id === song._id;

  return (
    <div className={styles.audioPlayer}>
      {/* Cover Art - Vinyl Style */}
      <div className={`${styles.coverArt} ${isCurrentSong && isPlaying ? styles.spinning : ''}`}>
        {song.coverArt ? (
          <img src={song.coverArt} alt={song.title} />
        ) : (
          <div className={styles.coverPlaceholder}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className={styles.songInfo}>
        <h3 className={styles.title}>{song.title}</h3>
        {song.artist && <p className={styles.artist}>{song.artist}</p>}
        {song.album && <p className={styles.album}>{song.album}</p>}
      </div>

      {/* Equalizer Visualization */}
      <div className={styles.visualization}>
        <Equalizer isPlaying={isCurrentSong && isPlaying} size="large" color="gradient" />
      </div>

      {/* Lyrics Toggle (if lyrics available) */}
      {song.lyrics && (
        <button
          className={styles.lyricsButton}
          onClick={() => setShowLyrics(!showLyrics)}
          aria-label="Toggle Lyrics"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
          {showLyrics ? 'Lyrics ausblenden' : 'Lyrics anzeigen'}
        </button>
      )}

      {/* Lyrics Display */}
      {song.lyrics && showLyrics && (
        <div className={styles.lyrics}>
          <h4>Lyrics</h4>
          <pre>{song.lyrics}</pre>
        </div>
      )}

      {/* Streaming Links */}
      {song.streamingLinks && (
        <div className={styles.streamingLinks}>
          <span className={styles.streamingLabel}>Hör uns auf:</span>
          <div className={styles.links}>
            {song.streamingLinks.spotify && (
              <a
                href={song.streamingLinks.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.streamingLink}
                aria-label="Spotify"
              >
                Spotify
              </a>
            )}
            {song.streamingLinks.appleMusic && (
              <a
                href={song.streamingLinks.appleMusic}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.streamingLink}
                aria-label="Apple Music"
              >
                Apple Music
              </a>
            )}
            {song.streamingLinks.youtube && (
              <a
                href={song.streamingLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.streamingLink}
                aria-label="YouTube"
              >
                YouTube
              </a>
            )}
            {song.streamingLinks.soundcloud && (
              <a
                href={song.streamingLinks.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.streamingLink}
                aria-label="SoundCloud"
              >
                SoundCloud
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}