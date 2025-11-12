// ============================================
// JOCH Bandpage - Public Gallery Page
// Display uploaded images for all visitors
// ============================================

import { useState, useEffect } from 'react';
import { GalleryImage } from '@joch/shared';
import { galleryService } from '@/services/gallery.service';
import styles from './Gallery.module.scss';

type CategoryFilter = 'all' | 'live' | 'promo' | 'backstage' | 'other';

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Open lightbox
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const handleCloseLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  // Navigate to next image
  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img._id === selectedImage._id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  // Navigate to previous image
  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img._id === selectedImage._id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        handleCloseLightbox();
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [selectedImage]);

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
        <div className={styles.lightbox} onClick={handleCloseLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className={styles.lightboxClose}
              onClick={handleCloseLightbox}
              aria-label="Schließen"
            >
              ✕
            </button>

            {/* Navigation Buttons */}
            {filteredImages.length > 1 && (
              <>
                <button
                  className={`${styles.lightboxNav} ${styles.prev}`}
                  onClick={handlePrevImage}
                  aria-label="Vorheriges Bild"
                >
                  ‹
                </button>
                <button
                  className={`${styles.lightboxNav} ${styles.next}`}
                  onClick={handleNextImage}
                  aria-label="Nächstes Bild"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <div className={styles.lightboxImageWrapper}>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title || 'Gallery Image'}
                className={styles.lightboxImage}
              />
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
