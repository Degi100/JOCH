// ============================================
// JOCH Bandpage - Admin News Manager
// CRUD Interface for managing news posts
// ============================================

import { useState, useEffect } from 'react';
import { NewsPost } from '@joch/shared';
import { newsService } from '@/services/news.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import NewsForm from './components/NewsForm';
import styles from './NewsManager.module.scss';

export default function NewsManager() {
  const { token } = useAuth();
  const [news, setNews] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await newsService.getAll();
      setNews(data);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Fehler beim Laden der News');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNews(null);
    setIsFormOpen(true);
  };

  const handleEdit = (newsPost: NewsPost) => {
    setEditingNews(newsPost);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diesen News-Post wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um News zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await newsService.delete(id, token);
      setNews(news.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('Fehler beim Löschen des News-Posts');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingNews(null);
    await loadNews();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingNews(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (published: boolean) => {
    if (published) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
          Veröffentlicht
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
        Entwurf
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.newsManagerPage}>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.newsManagerPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <Button onClick={loadNews}>Erneut versuchen</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newsManagerPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>News verwalten</h1>
              <p className={styles.subtitle}>
                Erstelle, bearbeite und lösche News-Posts
              </p>
            </div>
            <Button variant="primary" onClick={handleCreate}>
              + Neuer Post
            </Button>
          </div>
        </div>

        {/* News List */}
        {news.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📰</div>
            <h2 className={styles.emptyTitle}>Noch keine News vorhanden</h2>
            <p className={styles.emptyText}>
              Erstelle deinen ersten News-Post, um aktuelle Updates mit deinen Fans zu
              teilen.
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + Ersten Post erstellen
            </Button>
          </div>
        ) : (
          <div className={styles.newsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>Datum</div>
              <div className={styles.headerCell}>Titel & Auszug</div>
              <div className={styles.headerCell}>Status</div>
              <div className={styles.headerCell}>Aktionen</div>
            </div>

            <div className={styles.tableBody}>
              {news.map((newsPost) => (
                <div key={newsPost._id} className={styles.tableRow}>
                  <div className={styles.cell}>
                    <div className={styles.dateCell}>
                      <span className={styles.date}>
                        {formatDate(
                          newsPost.publishedAt
                            ? newsPost.publishedAt.toString()
                            : newsPost.createdAt.toString()
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.newsCell}>
                      <span className={styles.newsTitle}>{newsPost.title}</span>
                      {newsPost.excerpt && (
                        <span className={styles.newsExcerpt}>
                          {newsPost.excerpt.substring(0, 100)}
                          {newsPost.excerpt.length > 100 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cell}>{getStatusBadge(newsPost.published)}</div>

                  <div className={styles.cell}>
                    <div className={styles.actions}>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleEdit(newsPost)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDelete(newsPost._id!)}
                        isLoading={deletingId === newsPost._id}
                        disabled={deletingId === newsPost._id}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <NewsForm
          newsPost={editingNews}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}