// ============================================
// JOCH Bandpage - Admin User Manager
// Manage user roles (admin only)
// ============================================

import { useState, useEffect } from 'react';
import { User } from '@joch/shared';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './UserManager.module.scss';

export default function UserManager() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAll(token);
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Fehler beim Laden der Benutzer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member' | 'user') => {
    if (!token) {
      alert('Du musst eingeloggt sein');
      return;
    }

    // Prevent changing own role
    if (currentUser?._id === userId) {
      alert('Du kannst deine eigene Rolle nicht ändern');
      return;
    }

    try {
      setUpdatingId(userId);
      const updatedUser = await userService.updateRole(userId, newRole, token);
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert(err.message || 'Fehler beim Aktualisieren der Rolle');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return styles.badgeAdmin;
      case 'member':
        return styles.badgeMember;
      case 'user':
        return styles.badgeUser;
      default:
        return '';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'member':
        return 'Mitglied';
      case 'user':
        return 'Benutzer';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Benutzerverwaltung</h1>
        <p className={styles.subtitle}>
          Verwalte Benutzerrollen und Zugriffsrechte
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={loadUsers}>
            Erneut versuchen
          </Button>
        </div>
      )}

      {users.length === 0 ? (
        <div className={styles.empty}>
          <p>Keine Benutzer gefunden</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th>Registriert</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = user._id === currentUser?._id;
                const isUpdating = updatingId === user._id;

                return (
                  <tr key={user._id} className={isCurrentUser ? styles.currentUser : ''}>
                    <td>
                      <div className={styles.userName}>
                        {user.name || '-'}
                        {isCurrentUser && <span className={styles.youBadge}>Du</span>}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {isCurrentUser ? (
                          <span className={styles.noActions}>
                            Eigene Rolle kann nicht geändert werden
                          </span>
                        ) : (
                          <select
                            className={styles.roleSelect}
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(
                                user._id,
                                e.target.value as 'admin' | 'member' | 'user'
                              )
                            }
                            disabled={isUpdating}
                          >
                            <option value="user">Benutzer</option>
                            <option value="member">Mitglied</option>
                            <option value="admin">Administrator</option>
                          </select>
                        )}
                        {isUpdating && <LoadingSpinner />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.info}>
        <h3>Rollenübersicht</h3>
        <ul>
          <li>
            <strong>Benutzer:</strong> Kann öffentliche Inhalte sehen, hat keinen Admin-Zugriff
          </li>
          <li>
            <strong>Mitglied:</strong> Kann Admin-Dashboard nutzen und Inhalte verwalten (Gigs, News, etc.)
          </li>
          <li>
            <strong>Administrator:</strong> Vollzugriff inkl. Benutzerverwaltung und alle Admin-Funktionen
          </li>
        </ul>
      </div>
    </div>
  );
}