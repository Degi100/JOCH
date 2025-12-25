// ============================================
// JOCH Bandpage - Public Gallery Page
// Display uploaded images with slideshow feature
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { GalleryImage } from '@joch/shared';
import { galleryService } from '@/services/gallery.service';
import styles from './Gallery.module.scss';

type CategoryFilter = 'all' | 'live' | 'promo' | 'backstage' | 'other';

const SLIDESHOW_INTERVAL = 4000; // 4 seconds per image

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideshowRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  // Fetch all gallery images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const data = await galleryService.getAll();
        setImages(data);
        setFilteredImages(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching gallery images:', err);
        setError('Fehler beim Laden der Bilder');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Filter images by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter((img) => img.category === selectedCategory));
    }
  }, [selectedCategory, images]);

  // Navigate to next image
  const handleNextImage = useCallback(() => {
    if (!selectedImage || filteredImages.length === 0) return;
    const currentIndex = filteredImages.findIndex((img) => img._id === selectedImage._id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  }, [selectedImage, filteredImages]);

  // Navigate to previous image
  const handlePrevImage = useCallback(() => {
    if (!selectedImage || filteredImages.length === 0) return;
    const currentIndex = filteredImages.findIndex((img) => img._id === selectedImage._id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  }, [selectedImage, filteredImages]);

  // Slideshow auto-play
  useEffect(() => {
    if (isPlaying && selectedImage && filteredImages.length > 1) {
      slideshowRef.current = setInterval(() => {
        handleNextImage();
      }, SLIDESHOW_INTERVAL);
    }

    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
        slideshowRef.current = null;
      }
    };
  }, [isPlaying, selectedImage, handleNextImage, filteredImages.length]);

  // Open lightbox
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setIsPlaying(false);
    document.body.style.overflow = '';
  };

  // Start slideshow from first image
  const handleStartSlideshow = () => {
    if (filteredImages.length === 0) return;
    setSelectedImage(filteredImages[0]);
    setIsPlaying(true);
    document.body.style.overflow = 'hidden';
  };

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!lightboxRef.current) return;

    if (!document.fullscreenElement) {
      lightboxRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'Escape':
          handleCloseLightbox();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case ' ': // Space bar
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleNextImage, handlePrevImage, togglePlay, toggleFullscreen]);

  // Get current image index
  const getCurrentIndex = () => {
    if (!selectedImage) return 0;
    return filteredImages.findIndex((img) => img._id === selectedImage._id) + 1;
  };

  const categoryLabels: Record<CategoryFilter, string> = {
    all: 'Alle',
    live: 'Live',
    promo: 'Promo',
    backstage: 'Backstage',
    other: 'Andere',
  };

  return (
    <div className={styles.galleryPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Galerie</h1>
          <p className={styles.subtitle}>
            Einblicke in unsere Welt – Live, Backstage und mehr
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Category Filter */}
        <div className={styles.filterBar}>
          <div className={styles.filterButtons}>
            {(['all', 'live', 'promo', 'backstage', 'other'] as CategoryFilter[]).map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`${styles.filterButton} ${
                    selectedCategory === category ? styles.active : ''
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              )
            )}
          </div>

          {/* Slideshow Button */}
          {filteredImages.length > 1 && (
            <button
              className={styles.slideshowButton}
              onClick={handleStartSlideshow}
              title="Slideshow starten"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Slideshow</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingMessage}>
            <p>Bilder werden geladen...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredImages.length === 0 && (
          <div className={styles.emptyMessage}>
            <p>
              {selectedCategory === 'all'
                ? 'Noch keine Bilder in der Galerie'
                : `Keine Bilder in der Kategorie "${categoryLabels[selectedCategory]}"`}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !error && filteredImages.length > 0 && (
          <div className={styles.galleryGrid}>
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className={styles.galleryItem}
                onClick={() => handleImageClick(image)}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title || 'Gallery Image'}
                    className={styles.thumbnail}
                    loading="lazy"
                  />
                  <div className={styles.imageOverlay}>
                    <span className={styles.viewIcon}>🔍</span>
                  </div>
                </div>
                {image.title && (
                  <div className={styles.imageInfo}>
                    <h3 className={styles.imageTitle}>{image.title}</h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Count */}
        {!isLoading && !error && filteredImages.length > 0 && (
          <div className={styles.imageCount}>
            {filteredImages.length} {filteredImages.length === 1 ? 'Bild' : 'Bilder'}
            {selectedCategory !== 'all' && ` in "${categoryLabels[selectedCategory]}"`}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={handleCloseLightbox} ref={lightboxRef}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {/* Top Controls */}
            <div className={styles.lightboxControls}>
              {/* Image Counter */}
              <div className={styles.imageCounter}>
                {getCurrentIndex()} / {filteredImages.length}
              </div>

              {/* Play/Pause Button */}
              {filteredImages.length > 1 && (
                <button
                  className={`${styles.controlButton} ${isPlaying ? styles.playing : ''}`}
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause (Leertaste)' : 'Slideshow (Leertaste)'}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                className={styles.controlButton}
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Vollbild beenden (F)' : 'Vollbild (F)'}
              >
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>

              {/* Close Button */}
              <button
                className={styles.controlButton}
                onClick={handleCloseLightbox}
                title="Schließen (Esc)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Image with Navigation */}
            <div className={styles.lightboxImageWrapper}>
              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    className={`${styles.lightboxNav} ${styles.prev}`}
                    onClick={handlePrevImage}
                    aria-label="Vorheriges Bild"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button
                    className={`${styles.lightboxNav} ${styles.next}`}
                    onClick={handleNextImage}
                    aria-label="Nächstes Bild"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </>
              )}

              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title || 'Gallery Image'}
                className={styles.lightboxImage}
              />

              {/* Progress Bar for Slideshow */}
              {isPlaying && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    key={selectedImage._id}
                  />
                </div>
              )}
            </div>

            {/* Image Info */}
            {(selectedImage.title || selectedImage.description) && (
              <div className={styles.lightboxInfo}>
                {selectedImage.title && (
                  <h2 className={styles.lightboxTitle}>{selectedImage.title}</h2>
                )}
                {selectedImage.description && (
                  <p className={styles.lightboxDescription}>{selectedImage.description}</p>
                )}
                <span className={styles.lightboxCategory}>
                  {categoryLabels[selectedImage.category || 'other']}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
