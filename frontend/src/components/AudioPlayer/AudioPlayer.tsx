import { useState, useRef } from 'react';
import type { Song } from '@joch/shared';
import styles from './AudioPlayer.module.scss';

/**
 * AudioPlayer component props
 */
interface AudioPlayerProps {
  /**
   * Song to play
   */
  song: Song;
  /**
   * Optional autoplay
   */
  autoPlay?: boolean;
}

/**
 * Custom HTML5 Audio Player with controls
 *
 * Features:
 * - Play/Pause toggle
 * - Progress bar with seek
 * - Volume control
 * - Time display (current / total)
 * - Lyrics display toggle
 *
 * @example
 * ```tsx
 * <AudioPlayer song={songData} />
 * ```
 */
export default function AudioPlayer({ song, autoPlay = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showLyrics, setShowLyrics] = useState(false);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle loaded metadata (duration available)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle seek (progress bar click)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickX = e.clientX - progressBar.getBoundingClientRect().left;
      const width = progressBar.offsetWidth;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle song end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Audio source (with fallback)
  const audioSrc = song.audioUrl || song.audioFile;

  return (
    <div className={styles.audioPlayer}>
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        autoPlay={autoPlay}
      />

      {/* Cover Art */}
      <div className={styles.coverArt}>
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

      {/* Controls */}
      <div className={styles.controls}>
        {/* Play/Pause Button */}
        <button
          className={styles.playButton}
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            // Pause Icon
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            // Play Icon
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className={styles.progressWrapper}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <div className={styles.progressBar} onClick={handleSeek}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div className={styles.volumeControl}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.volumeIcon}>
            {volume > 0.5 ? (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            ) : volume > 0 ? (
              <path d="M7 9v6h4l5 5V4l-5 5H7z" />
            ) : (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            )}
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label="Volume"
          />
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
            Lyrics
          </button>
        )}
      </div>

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