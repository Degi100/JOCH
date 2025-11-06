// ============================================
// JOCH Bandpage - Admin Gallery Manager
// CRUD Interface for managing gallery images
// ============================================

import { useState, useEffect } from 'react';
import { GalleryImage } from '@joch/shared';
import { galleryService } from '@/services/gallery.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import GalleryForm from './components/GalleryForm';
import styles from './GalleryManager.module.scss';

export default function GalleryManager() {
  const { token } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await galleryService.getAll();
      setImages(data);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Fehler beim Laden der Bilder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingImage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du dieses Bild wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um Bilder zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await galleryService.delete(id, token);
      setImages(images.filter((img) => img._id !== id));
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Fehler beim Löschen des Bildes');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingImage(null);
    await loadImages();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingImage(null);
  };

  // Get category badge
  const getCategoryBadge = (category?: string) => {
    const categoryMap = {
      live: { label: 'Live', className: styles.categoryLive },
      promo: { label: 'Promo', className: styles.categoryPromo },
      backstage: { label: 'Backstage', className: styles.categoryBackstage },
      other: { label: 'Andere', className: styles.categoryOther },
    };

    const cat = categoryMap[category as keyof typeof categoryMap] || categoryMap.other;
    return (
      <span className={`${styles.categoryBadge} ${cat.className}`}>
        {cat.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.galleryManagerPage}>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.galleryManagerPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <Button onClick={loadImages}>Erneut versuchen</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galleryManagerPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Galerie verwalten</h1>
              <p className={styles.subtitle}>
                Erstelle, bearbeite und lösche Bilder
              </p>
            </div>
            <Button variant="primary" onClick={handleCreate}>
              + Neues Bild
            </Button>
          </div>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📸</div>
            <h2 className={styles.emptyTitle}>Noch keine Bilder vorhanden</h2>
            <p className={styles.emptyText}>
              Füge dein erstes Bild hinzu, um deine Galerie zu starten.
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + Erstes Bild hinzufügen
            </Button>
          </div>
        ) : (
          <div className={styles.imagesGrid}>
            {images.map((image) => (
              <div key={image._id} className={styles.imageCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title || 'Gallery image'}
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEdit(image)}
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleDelete(image._id!)}
                      isLoading={deletingId === image._id}
                      disabled={deletingId === image._id}
                    >
                      Löschen
                    </Button>
                  </div>
                </div>
                <div className={styles.imageInfo}>
                  <div className={styles.imageHeader}>
                    <h3 className={styles.imageTitle}>
                      {image.title || 'Ohne Titel'}
                    </h3>
                    {image.category && getCategoryBadge(image.category)}
                  </div>
                  {image.description && (
                    <p className={styles.imageDescription}>
                      {image.description.substring(0, 80)}
                      {image.description.length > 80 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <GalleryForm
          image={editingImage}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}