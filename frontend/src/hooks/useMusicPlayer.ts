// ============================================
// JOCH Bandpage - Music Player Hook
// Play music and detect beats for lightshow sync
// ============================================

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMusicPlayerProps {
  audioUrl?: string;
  onBeat?: () => void;
}

export const useMusicPlayer = ({ audioUrl, onBeat }: UseMusicPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastBeatTimeRef = useRef<number>(0);

  // Initialize Audio Element
  useEffect(() => {
    if (!audioUrl) {
      console.log('⚠️ No audio URL provided');
      return;
    }

    console.log('🎵 Initializing audio with URL:', audioUrl);

    // Erstelle Audio-Element mit URL direkt
    const audio = new Audio(audioUrl);

    // CORS für Cloudinary
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.7;
    audio.preload = 'auto';

    audioRef.current = audio;

    console.log('🔊 Audio element created with src:', audio.src);

    // Update duration when metadata loads
    audio.addEventListener('loadedmetadata', () => {
      console.log('✅ Audio metadata loaded, duration:', audio.duration);
      setDuration(audio.duration);
    });

    // Update current time
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    // Handle end of track
    audio.addEventListener('ended', () => {
      console.log('⏹️ Audio ended');
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // Error handling
    audio.addEventListener('error', (e) => {
      console.error('❌ Audio error:', e);
      console.error('❌ Audio error details:', audio.error);
    });

    return () => {
      console.log('🧹 Cleaning up audio element');
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // Initialize Web Audio API for beat detection (only once!)
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;
    if (audioContextRef.current) {
      console.log('✅ Audio context already initialized, resuming...');
      audioContextRef.current.resume();
      return;
    }

    console.log('🎛️ Initializing Web Audio API...');
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);

      analyser.fftSize = 512; // Higher = more precise, lower = faster
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      console.log('✅ Web Audio API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Web Audio API:', error);
    }

    return () => {
      if (audioContextRef.current) {
        console.log('⏸️ Suspending audio context');
        audioContextRef.current.suspend();
      }
    };
  }, [isPlaying]);

  // Beat Detection Loop
  const detectBeat = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average bass frequency (0-100Hz range)
    const bassRange = Math.floor(bufferLength * 0.15); // First 15% of frequencies (more bass range)
    let bassSum = 0;
    for (let i = 0; i < bassRange; i++) {
      bassSum += dataArray[i];
    }
    const bassAverage = bassSum / bassRange;

    // Beat threshold (lowered for more sensitivity)
    const beatThreshold = 150; // Lowered from 200 to 150
    const now = Date.now();
    const timeSinceLastBeat = now - lastBeatTimeRef.current;

    // Detect beat if bass is strong and enough time has passed (prevent double triggers)
    if (bassAverage > beatThreshold && timeSinceLastBeat > 250) { // Faster detection (250ms instead of 300ms)
      console.log('🥁 BEAT DETECTED! Bass:', Math.round(bassAverage));
      lastBeatTimeRef.current = now;
      onBeat?.();
    }

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(detectBeat);
  }, [isPlaying, onBeat]);

  // Start/Stop beat detection
  useEffect(() => {
    if (isPlaying) {
      detectBeat();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, detectBeat]);

  // Play music
  const play = useCallback(() => {
    console.log('▶️ play() called');
    if (!audioRef.current) {
      console.error('❌ No audio element found in audioRef');
      return;
    }

    console.log('🎵 Attempting to play audio...');
    console.log('   Audio src:', audioRef.current.src);
    console.log('   Audio readyState:', audioRef.current.readyState);
    console.log('   Audio networkState:', audioRef.current.networkState);

    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        console.log('✅ Music started playing successfully!');
      })
      .catch((error) => {
        console.error('❌ Failed to play music:', error);
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('This is usually caused by browser autoplay policy.');
        console.error('User interaction is required before playing audio.');
      });
  }, []);

  // Pause music
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('⏸️ Music paused');
    }
  }, []);

  // Stop music (pause + reset to start)
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      console.log('⏹️ Music stopped');
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    stop,
  };
};
