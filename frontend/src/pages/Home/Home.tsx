// ============================================
// JOCH Bandpage - Home Page
// Landing page with Hero, News preview, Gigs preview
// ============================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gigService, newsService } from '../../services';
import { galleryService } from '../../services/gallery.service';
import { useConcertModeContext } from '../../context/ConcertModeContext';
import SimpleSpotlight from '../../components/SimpleSpotlight/SimpleSpotlight';
import type { Gig, NewsPost, GalleryImage } from '@joch/shared';
import styles from './Home.module.scss';
import heroImage from '../../bilder/IMG-20241013-WA0076.jpg';
import jochImage from '../../bilder/JOCH.jpg';

const Home: React.FC = () => {
  const { isShowActive } = useConcertModeContext();
  const [upcomingGigs, setUpcomingGigs] = useState<Gig[]>([]);
  const [latestNews, setLatestNews] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Slideshow images for concert mode - combine local and gallery images
  const slideshowImages = [...[heroImage, jochImage], ...galleryImages];

  // Debug logging
  console.log('🏠 Home - isShowActive:', isShowActive);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming gigs (limit 3)
        const gigs = await gigService.getUpcoming();
        setUpcomingGigs(gigs.slice(0, 3));

        // Fetch latest news (limit 3)
        const news = await newsService.getAll();
        setLatestNews(news.slice(0, 3));

        // Fetch gallery images for slideshow
        try {
          const gallery = await galleryService.getAll();
          if (gallery.length > 0) {
            // Get image URLs from gallery items
            const imageUrls = gallery.map(img => img.imageUrl).filter(url => url);
            setGalleryImages(imageUrls);
            console.log('📸 Loaded gallery images for slideshow:', imageUrls.length);
          }
        } catch (galleryError) {
          console.log('📸 No gallery images available (this is OK):', galleryError);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroOverlay} ${isShowActive ? styles.lightshowActive : ''}`}></div>

        {/* Simple Spotlight Effect with Slideshow */}
        <SimpleSpotlight
          imageUrl={heroImage}
          isActive={isShowActive}
          slideImages={slideshowImages}
        />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>JOCH</h1>
          <p className={styles.heroTagline}>Ehrliche Musik. Ohne Filter.</p>
          <p className={styles.heroDescription}>
            Deutschrock aus Bremen-Nord seit 2022.
            <br />
            Kraftvolle Texte. Authentische Bühnenpräsenz.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/live" className={styles.heroButton}>
              Nächste Konzerte
            </Link>
            <Link to="/music" className={`${styles.heroButton} ${styles.secondary}`}>
              Musik hören
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Gigs Section */}
      {!isLoading && upcomingGigs.length > 0 && (
        <section className={`${styles.section} ${styles.gigsSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nächste Konzerte</h2>
              <Link to="/live" className={styles.sectionLink}>
                Alle Termine →
              </Link>
            </div>

            <div className={styles.gigsGrid}>
              {upcomingGigs.map((gig) => (
                <div key={gig._id} className={styles.gigCard}>
                  <div className={styles.gigDate}>
                    <span className={styles.gigDay}>
                      {new Date(gig.date).getDate()}
                    </span>
                    <span className={styles.gigMonth}>
                      {new Date(gig.date).toLocaleDateString('de-DE', {
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className={styles.gigInfo}>
                    <h3 className={styles.gigVenue}>{gig.venue}</h3>
                    <p className={styles.gigLocation}>{gig.location}</p>
                    {gig.time && (
                      <p className={styles.gigTime}>{gig.time} Uhr</p>
                    )}
                  </div>
                  {gig.ticketLink && (
                    <a
                      href={gig.ticketLink}
                      className={styles.gigTicketButton}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tickets
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News Section */}
      {!isLoading && latestNews.length > 0 && (
        <section className={`${styles.section} ${styles.newsSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Neueste News</h2>
              <Link to="/news" className={styles.sectionLink}>
                Alle News →
              </Link>
            </div>

            <div className={styles.newsGrid}>
              {latestNews.map((post) => (
                <Link
                  key={post._id}
                  to={`/news/${post.slug || post._id}`}
                  className={styles.newsCard}
                >
                  {post.coverImage && (
                    <div className={styles.newsImage}>
                      <img src={post.coverImage} alt={post.title} />
                    </div>
                  )}
                  <div className={styles.newsContent}>
                    <h3 className={styles.newsTitle}>{post.title}</h3>
                    <p className={styles.newsExcerpt}>
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>
                    <div className={styles.newsMeta}>
                      <span className={styles.newsDate}>
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                          'de-DE',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Band Section - TODO: Load from backend later */}
      <section className={`${styles.section} ${styles.aboutSection}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Die Band</h2>
          <p className={styles.aboutText}>
            JOCH ist eine Deutschrock-Band aus Bremen-Nord, die seit 2022
            mit kraftvollen Texten und authentischer Bühnenpräsenz begeistert.
            Unsere Musik ist ehrlich, direkt und ohne Filter – vom echten Leben
            inspiriert. Mal laut, mal leise, mal wütend, mal nachdenklich.
            Sozialkritisch. Echt.
          </p>
          <Link to="/band" className={styles.aboutButton}>
            Mehr über uns →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
