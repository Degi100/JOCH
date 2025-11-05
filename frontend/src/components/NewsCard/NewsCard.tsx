import { NewsPost } from '@joch/shared';
import styles from './NewsCard.module.scss';

/**
 * NewsCard component props
 */
interface NewsCardProps {
  /**
   * News post data to display
   */
  post: NewsPost;

  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * NewsCard component displays a news post with image, title, and excerpt
 *
 * @example
 * ```tsx
 * <NewsCard post={newsPost} onClick={() => navigate(`/news/${post.slug}`)} />
 * ```
 */
export default function NewsCard({ post, onClick }: NewsCardProps) {
  const publishedDate = new Date(post.publishedAt || post.createdAt);
  const formattedDate = publishedDate.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Generate excerpt from content if not provided
  const excerpt =
    post.excerpt ||
    post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');

  const cardClasses = [styles.newsCard, onClick && styles.clickable]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClasses} onClick={onClick}>
      {/* Featured Image */}
      {(post.featuredImage || post.coverImage) && (
        <div className={styles.imageWrapper}>
          <img
            src={post.featuredImage || post.coverImage}
            alt={post.title}
            className={styles.image}
          />
          {(post.status === 'draft' || !post.published) && (
            <span className={styles.draftBadge}>Entwurf</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {/* Meta */}
        <div className={styles.meta}>
          <time dateTime={publishedDate.toISOString()} className={styles.date}>
            {formattedDate}
          </time>
          {post.author && typeof post.author === 'object' && (
            <>
              <span className={styles.separator}>•</span>
              <span className={styles.author}>{post.author.name}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className={styles.title}>{post.title}</h3>

        {/* Excerpt */}
        <p className={styles.excerpt}>{excerpt}</p>

        {/* Read More Link */}
        <div className={styles.readMore}>
          Weiterlesen
          <svg
            className={styles.arrow}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </article>
  );
}
