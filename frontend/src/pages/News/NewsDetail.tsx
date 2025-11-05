import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { NewsPost } from '@joch/shared';
import { newsService } from '../../services/news.service';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Button from '../../components/Button/Button';
import styles from './NewsDetail.module.scss';

/**
 * News Detail Page - Full article view
 *
 * Features:
 * - Full article content
 * - Featured image
 * - Author and date
 * - Back to news button
 */
export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setIsLoading(true);
      const data = await newsService.getById(postId);
      setPost(data);
    } catch (err) {
      console.error('Error loading post:', err);
      setError('News-Artikel nicht gefunden');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: Date | string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBackClick = () => {
    navigate('/news');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorContent}>
          <h1>{error || 'News-Artikel nicht gefunden'}</h1>
          <Button onClick={handleBackClick} variant="primary">
            Zurück zu News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className={styles.newsDetail}>
      {/* Back Button */}
      <div className={styles.backButtonWrapper}>
        <div className={styles.container}>
          <Button onClick={handleBackClick} variant="ghost">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Zurück zu News
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        {(post.featuredImage || post.coverImage) && (
          <div className={styles.featuredImage}>
            <img
              src={post.featuredImage || post.coverImage}
              alt={post.title}
            />
          </div>
        )}

        <div className={styles.headerContent}>
          <div className={styles.container}>
            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.meta}>
              {post.author && typeof post.author === 'object' && (
                <span className={styles.author}>
                  Von <strong>{post.author.name}</strong>
                </span>
              )}
              {post.publishedAt && (
                <time className={styles.date}>
                  {formatDate(post.publishedAt)}
                </time>
              )}
              {(post.status === 'draft' || !post.published) && (
                <span className={styles.draftBadge}>Entwurf</span>
              )}
            </div>

            {post.excerpt && (
              <p className={styles.excerpt}>{post.excerpt}</p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.articleContent}>
            {/* Render content (split by line breaks for basic formatting) */}
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.trim() === '') return null;
              return (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <Button onClick={handleBackClick} variant="primary" fullWidth>
              Zurück zur News-Übersicht
            </Button>
          </div>
        </div>
      </footer>
    </article>
  );
}