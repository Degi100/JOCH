// ============================================
// JOCH Bandpage - Admin Messages Manager
// View and manage contact form submissions
// ============================================

import { useState, useEffect } from 'react';
import { ContactMessage } from '@joch/shared';
import { contactService } from '@/services/contact.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './MessagesManager.module.scss';

export default function MessagesManager() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await contactService.getAll(token);
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Fehler beim Laden der Nachrichten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpand = async (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Mark as read if not already read
      if (!isRead && token) {
        try {
          await contactService.markAsRead(id, token);
          setMessages(messages.map(m =>
            m._id === id ? { ...m, read: true } : m
          ));
        } catch (err) {
          console.error('Error marking message as read:', err);
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diese Nachricht wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um Nachrichten zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await contactService.delete(id, token);
      setMessages(messages.filter((m) => m._id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Fehler beim Löschen der Nachricht');
    } finally {
      setDeletingId(null);
    }
  };

  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get unread count
  const unreadCount = messages.filter(m => !m.read).length;

  if (isLoading) {
    return (
      <div className={styles.messagesManagerPage}>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messagesManagerPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <Button onClick={loadMessages}>Erneut versuchen</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesManagerPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Nachrichten</h1>
              <p className={styles.subtitle}>
                Kontaktanfragen und Booking-Requests
                {unreadCount > 0 && (
                  <span className={styles.unreadBadge}>
                    {unreadCount} ungelesen
                  </span>
                )}
              </p>
            </div>
            <Button variant="secondary" onClick={loadMessages}>
              Aktualisieren
            </Button>
          </div>
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📧</div>
            <h2 className={styles.emptyTitle}>Noch keine Nachrichten vorhanden</h2>
            <p className={styles.emptyText}>
              Sobald jemand das Kontaktformular ausfüllt, erscheinen die Nachrichten hier.
            </p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`${styles.messageCard} ${
                  !message.read ? styles.unread : ''
                } ${expandedId === message._id ? styles.expanded : ''}`}
              >
                <div
                  className={styles.messageHeader}
                  onClick={() => handleToggleExpand(message._id!, message.read)}
                >
                  <div className={styles.messageInfo}>
                    <div className={styles.messageMeta}>
                      {!message.read && (
                        <span className={styles.unreadIndicator}>●</span>
                      )}
                      <h3 className={styles.messageName}>{message.name}</h3>
                      <span className={styles.messageDate}>
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className={styles.messageEmail}>{message.email}</p>
                    {message.subject && (
                      <p className={styles.messageSubject}>{message.subject}</p>
                    )}
                  </div>
                  <button
                    className={styles.expandButton}
                    aria-label={expandedId === message._id ? 'Zuklappen' : 'Aufklappen'}
                  >
                    {expandedId === message._id ? '−' : '+'}
                  </button>
                </div>

                {expandedId === message._id && (
                  <div className={styles.messageBody}>
                    <div className={styles.messageContent}>
                      <h4 className={styles.contentLabel}>Nachricht:</h4>
                      <p className={styles.messageText}>{message.message}</p>
                    </div>
                    <div className={styles.messageActions}>
                      <a
                        href={`mailto:${message.email}?subject=Re: ${message.subject || 'Kontaktanfrage'}`}
                        className={styles.replyButton}
                      >
                        📧 Antworten
                      </a>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDelete(message._id!)}
                        isLoading={deletingId === message._id}
                        disabled={deletingId === message._id}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}