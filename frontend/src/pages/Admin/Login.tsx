// ============================================
// JOCH Bandpage - Admin Login Page
// Authentication for band members
// ============================================

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './Login.module.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>JOCH Admin</h1>
            <p className={styles.subtitle}>Bandmitglieder Login</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Einloggen...' : 'Einloggen'}
            </Button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Nur für Bandmitglieder. Bei Problemen kontaktiere den Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;