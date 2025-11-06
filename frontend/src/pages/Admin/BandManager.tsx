// ============================================
// JOCH Bandpage - Admin Band Manager
// CRUD Interface for managing band members
// ============================================

import { useState, useEffect } from 'react';
import { BandMember } from '@joch/shared';
import { bandService } from '@/services/band.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import BandMemberForm from './components/BandMemberForm';
import styles from './BandManager.module.scss';

export default function BandManager() {
  const { token } = useAuth();
  const [members, setMembers] = useState<BandMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BandMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bandService.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Error loading band members:', err);
      setError('Fehler beim Laden der Bandmitglieder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: BandMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du dieses Bandmitglied wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um Bandmitglieder zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await bandService.delete(id, token);
      setMembers(members.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Error deleting band member:', err);
      alert('Fehler beim Löschen des Bandmitglieds');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingMember(null);
    await loadMembers();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  if (isLoading) {
    return (
      <div className={styles.bandManagerPage}>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.bandManagerPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <Button onClick={loadMembers}>Erneut versuchen</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bandManagerPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Band verwalten</h1>
              <p className={styles.subtitle}>
                Erstelle, bearbeite und lösche Bandmitglieder
              </p>
            </div>
            <Button variant="primary" onClick={handleCreate}>
              + Neues Mitglied
            </Button>
          </div>
        </div>

        {/* Members Grid */}
        {members.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>👥</div>
            <h2 className={styles.emptyTitle}>Noch keine Bandmitglieder vorhanden</h2>
            <p className={styles.emptyText}>
              Füge dein erstes Bandmitglied hinzu, um die Band-Seite zu vervollständigen.
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + Erstes Mitglied hinzufügen
            </Button>
          </div>
        ) : (
          <div className={styles.membersGrid}>
            {members.map((member) => (
              <div key={member._id} className={styles.memberCard}>
                <div className={styles.memberImage}>
                  <img
                    src={member.image || member.photo || '/placeholder.jpg'}
                    alt={member.name}
                    className={styles.image}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <p className={styles.memberInstrument}>{member.instrument}</p>
                  {member.role && (
                    <p className={styles.memberRole}>{member.role}</p>
                  )}
                  {member.bio && (
                    <p className={styles.memberBio}>
                      {member.bio.substring(0, 100)}
                      {member.bio.length > 100 ? '...' : ''}
                    </p>
                  )}
                  <div className={styles.memberSocials}>
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        📷 Instagram
                      </a>
                    )}
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        📘 Facebook
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        🐦 Twitter
                      </a>
                    )}
                  </div>
                </div>
                <div className={styles.memberActions}>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleEdit(member)}
                    fullWidth
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(member._id!)}
                    isLoading={deletingId === member._id}
                    disabled={deletingId === member._id}
                    fullWidth
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <BandMemberForm
          member={editingMember}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}