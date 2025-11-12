import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NewsPost } from '@joch/shared';
import { newsService } from '../../services/news.service';
import NewsCard from '../../components/NewsCard/NewsCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './News.module.scss';

/**
 * News Page - List all news posts
 *
 * Features:
 * - Hero section
 * - News list with cards
 * - Click to navigate to detail page
 */
export default function News() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await newsService.getAll();
      // Sort by published date descending
      const sortedData = data.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
      setPosts(sortedData);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Fehler beim Laden der News');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (post: NewsPost) => {
    navigate(`/news/${post._id}`);
  };

  return (
    <div className={styles.newsPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>News</h1>
          <p className={styles.subtitle}>
            Bleibt auf dem Laufenden! Hier findet ihr alle News, Updates und Stories rund um
            JOCH – von neuen Releases über Tour-Ankündigungen bis hin zu Behind-the-Scenes
            Einblicken.
          </p>
        </div>
      </section>

      {/* News List */}
      <section className={styles.content}>
        <div className={styles.container}>
          {isLoading ? (
            <div className={styles.loadingWrapper}>
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.empty}>
              <p>Noch keine News verfügbar.</p>
            </div>
          ) : (
            <div className={styles.newsGrid}>
              {posts.map((post) => (
                <NewsCard
                  key={post._id}
                  post={post}
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
