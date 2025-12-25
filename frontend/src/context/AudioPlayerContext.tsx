// ============================================
// JOCH Bandpage - Audio Player Context
// Global audio player state management
// ============================================

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import type { Song } from '@joch/shared';

// ============================================
// Types
// ============================================

type RepeatMode = 'none' | 'one' | 'all';

interface AudioPlayerContextType {
  // Current state
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  isLoading: boolean;

  // Actions
  playSong: (song: Song, playlist?: Song[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setPlaylist: (songs: Song[]) => void;
  clearPlayer: () => void;
}

// ============================================
// Context
// ============================================

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

// ============================================
// Storage Keys
// ============================================

const VOLUME_KEY = 'joch-player-volume';
const MUTED_KEY = 'joch-player-muted';

// ============================================
// Provider Component
// ============================================

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({
  children,
}) => {
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [originalPlaylist, setOriginalPlaylist] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.7;
  });
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem(MUTED_KEY) === 'true';
  });
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = isMuted ? 0 : volume;
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      console.error('Audio playback error');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [repeatMode]);

  // Update audio volume when volume/muted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Persist volume settings
  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem(MUTED_KEY, String(isMuted));
  }, [isMuted]);

  // Get current song index in playlist
  const getCurrentIndex = useCallback(() => {
    if (!currentSong) return -1;
    return playlist.findIndex((s) => s._id === currentSong._id);
  }, [currentSong, playlist]);

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ============================================
  // Actions
  // ============================================

  const playSong = useCallback((song: Song, newPlaylist?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Update playlist if provided
    if (newPlaylist) {
      setOriginalPlaylist(newPlaylist);
      setPlaylistState(newPlaylist);
      setIsShuffled(false);
    }

    // Set current song
    setCurrentSong(song);

    // Get audio URL
    const audioUrl = song.audioFile || song.audioUrl;
    if (!audioUrl) {
      console.error('No audio URL for song:', song.title);
      return;
    }

    // Load and play
    audio.src = audioUrl;
    audio.play().catch((err) => {
      console.error('Playback failed:', err);
    });
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (playlist.length === 0) return;

    const currentIndex = getCurrentIndex();
    let nextIndex: number;

    if (currentIndex === -1 || currentIndex >= playlist.length - 1) {
      // At end of playlist
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Stop playback
        setIsPlaying(false);
        return;
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    const nextSong = playlist[nextIndex];
    if (nextSong) {
      playSong(nextSong);
    }
  }, [playlist, getCurrentIndex, repeatMode, playSong]);

  const prev = useCallback(() => {
    if (playlist.length === 0) return;

    const audio = audioRef.current;

    // If more than 3 seconds in, restart current song
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const currentIndex = getCurrentIndex();
    let prevIndex: number;

    if (currentIndex <= 0) {
      // At start of playlist
      if (repeatMode === 'all') {
        prevIndex = playlist.length - 1;
      } else {
        // Restart current song
        if (audio) audio.currentTime = 0;
        return;
      }
    } else {
      prevIndex = currentIndex - 1;
    }

    const prevSong = playlist[prevIndex];
    if (prevSong) {
      playSong(prevSong);
    }
  }, [playlist, getCurrentIndex, repeatMode, playSong]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (clampedVolume > 0) {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      if (!prev) {
        // Enable shuffle
        const shuffled = shuffleArray(originalPlaylist);
        setPlaylistState(shuffled);
      } else {
        // Disable shuffle - restore original order
        setPlaylistState(originalPlaylist);
      }
      return !prev;
    });
  }, [originalPlaylist]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const setPlaylist = useCallback((songs: Song[]) => {
    setOriginalPlaylist(songs);
    setPlaylistState(songs);
    setIsShuffled(false);
  }, []);

  const clearPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setCurrentSong(null);
    setPlaylistState([]);
    setOriginalPlaylist([]);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Context value
  const value: AudioPlayerContextType = {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    isLoading,
    playSong,
    play,
    pause,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setPlaylist,
    clearPlayer,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

/**
 * Custom hook to use AudioPlayer context
 * @throws Error if used outside AudioPlayerProvider
 */
export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);

  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }

  return context;
};
