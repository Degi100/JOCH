import React, { useState, useEffect, useRef } from 'react';
import styles from './Slideshow.module.scss';

interface SlideshowProps {
  images: string[];
  interval?: number; // Default interval in ms
  beatSync?: boolean; // Sync with music beats
}

// Global state that persists across re-renders
let globalBeatCount = 0;
let globalCurrentIndex = 0;

const Slideshow: React.FC<SlideshowProps> = ({
  images,
  interval = 5000,
  beatSync = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(globalCurrentIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBeatPulse, setShowBeatPulse] = useState(false);
  const [beatCount, setBeatCount] = useState(globalBeatCount);
  const mountedRef = useRef(true);

  // Debug current state
  useEffect(() => {
    console.log('🎯 Current Index:', currentIndex);
    console.log('🎯 Is Transitioning:', isTransitioning);
    console.log('🎯 Total Images:', images.length);
    console.log('🎯 Active Image URL:', images[currentIndex]);
  }, [currentIndex, isTransitioning, images.length, images]);

  // Track mounted state and reset on unmount
  useEffect(() => {
    mountedRef.current = true;

    // Reset global state when concert mode stops
    if (!beatSync) {
      globalBeatCount = 0;
      globalCurrentIndex = 0;
      setCurrentIndex(0);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [beatSync]);

  // Debug logging
  useEffect(() => {
    console.log('📸 Slideshow initialized with', images.length, 'images');
    console.log('📸 Images:', images);
    console.log('📸 Global beat count:', globalBeatCount);
    setBeatCount(globalBeatCount); // Restore beat count from global
  }, [images]);

  useEffect(() => {
    if (!beatSync) {
      // Normal interval-based slideshow
      const timer = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % images.length);
          setIsTransitioning(false);
        }, 300);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [images.length, interval, beatSync]);

  useEffect(() => {
    if (beatSync) {
      console.log('🎧 Slideshow: Setting up beat listener');

      // Beat-synchronized slideshow
      const handleBeat = (event: Event) => {
        if (!mountedRef.current) return;

        globalBeatCount++;
        const newCount = globalBeatCount;
        setBeatCount(newCount);
        console.log('🎵 Slideshow: Beat received! Count:', newCount, 'Event:', event);

        // Show beat pulse animation
        setShowBeatPulse(true);
        setTimeout(() => {
          if (mountedRef.current) setShowBeatPulse(false);
        }, 150);

        // Change image every 4 beats (1 bar in 4/4 time) - reduced for quick testing
        if (newCount % 4 === 0 && newCount > 0) {
          console.log('🖼️🖼️🖼️ Slideshow: CHANGING IMAGE at beat', newCount, '!');
          if (mountedRef.current) {
            // Directly change the image without transition flag
            globalCurrentIndex = (globalCurrentIndex + 1) % images.length;
            setCurrentIndex(globalCurrentIndex);
            console.log(`🖼️ Slideshow: Switched to image ${globalCurrentIndex} - URL: ${images[globalCurrentIndex]}`);
          }
        }
      };

      window.addEventListener('musicBeat', handleBeat);
      return () => {
        mountedRef.current = false;
        window.removeEventListener('musicBeat', handleBeat);
      };
    }
  }, [images.length, beatSync]);

  if (images.length === 0) return null;

  return (
    <div className={styles.slideshow}>
      {images.map((image, index) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={`slide-${index}`}
            className={`${styles.slide} ${
              isActive ? styles.active : ''
            } ${isTransitioning && isActive ? styles.transitioning : ''}`}
            style={{
              backgroundImage: `url(${image})`
            }}
            data-index={index}
            data-active={isActive}
          />
        );
      })}

      {/* Beat indicator for debugging */}
      {beatSync && (
        <div className={styles.beatIndicator}>
          <div className={`${styles.beatDot} ${showBeatPulse ? styles.pulse : ''}`} />
          <span className={styles.beatCount}>{beatCount}</span>
          <span style={{ marginLeft: '10px', color: '#ff6b35' }}>
            Img: {currentIndex + 1}/{images.length}
          </span>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {images[currentIndex]?.substring(images[currentIndex].lastIndexOf('/') + 1)}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Slideshow);