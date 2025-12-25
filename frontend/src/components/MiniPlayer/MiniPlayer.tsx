// ============================================
// JOCH Bandpage - Mini Player Component
// Sticky bottom player bar for music playback
// ============================================

import { useAudioPlayer } from '@/context/AudioPlayerContext';
import Equalizer from '../Equalizer/Equalizer';
import styles from './MiniPlayer.module.scss';

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayer();

  // Don't render if no song is loaded
  if (!currentSong) return null;

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className={styles.miniPlayer}>
      {/* Mobile Progress Bar - Top of MiniPlayer */}
      <div className={styles.mobileProgress} onClick={handleProgressClick}>
        <div className={styles.mobileProgressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.container}>
        {/* Song Info */}
        <div className={styles.songInfo}>
          <div className={`${styles.coverArt} ${isPlaying ? styles.playing : ''}`}>
            {currentSong.coverArt ? (
              <img src={currentSong.coverArt} alt={currentSong.title} />
            ) : (
              <div className={styles.coverPlaceholder}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            {/* Vinyl overlay effect */}
            <div className={styles.vinylOverlay} />
          </div>
          <div className={styles.songText}>
            <span className={styles.title}>{currentSong.title}</span>
            {currentSong.artist && (
              <span className={styles.artist}>{currentSong.artist}</span>
            )}
          </div>
          {/* Equalizer Animation */}
          <div className={styles.equalizerWrapper}>
            <Equalizer isPlaying={isPlaying} size="small" color="gradient" />
          </div>
        </div>

        {/* Main Controls */}
        <div className={styles.mainControls}>
          {/* Shuffle Button */}
          <button
            className={`${styles.controlBtn} ${styles.secondary} ${isShuffled ? styles.active : ''}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          {/* Previous Button */}
          <button className={styles.controlBtn} onClick={prev} title="Zurück">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            className={`${styles.controlBtn} ${styles.playBtn}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Abspielen'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button className={styles.controlBtn} onClick={next} title="Weiter">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Repeat Button */}
          <button
            className={`${styles.controlBtn} ${styles.secondary} ${repeatMode !== 'none' ? styles.active : ''}`}
            onClick={toggleRepeat}
            title={repeatMode === 'one' ? 'Song wiederholen' : repeatMode === 'all' ? 'Playlist wiederholen' : 'Wiederholen aus'}
          >
            {repeatMode === 'one' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            )}
          </button>

          {/* Mobile Volume Controls */}
          <div className={styles.mobileVolumeControls}>
            <button
              className={`${styles.controlBtn} ${styles.secondary}`}
              onClick={toggleMute}
              title={isMuted ? 'Ton an' : 'Stumm'}
            >
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.mobileVolumeSlider}
            />
          </div>
        </div>

        {/* Right Section: Progress + Volume */}
        <div className={styles.rightSection}>
          {/* Progress Section */}
          <div className={styles.progressSection}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <div className={styles.progressBar} onClick={handleProgressClick}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>

          {/* Volume Controls */}
          <div className={styles.volumeControls}>
            <button
              className={styles.controlBtn}
              onClick={toggleMute}
              title={isMuted ? 'Ton an' : 'Stumm'}
            >
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
