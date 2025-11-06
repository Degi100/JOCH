// ============================================
// JOCH Bandpage - Register Page
// User registration for fans
// ============================================

import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import styles from './Login.module.scss';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password, name });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
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
            <h1 className={styles.title}>JOCH Account</h1>
            <p className={styles.subtitle}>Registriere dich für exklusive Inhalte</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <Input
              label="Name (optional)"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              autoComplete="name"
              autoFocus
            />

            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={8}
            />

            <Input
              label="Passwort bestätigen"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={8}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || !email || !password || !confirmPassword}
            >
              {isLoading ? 'Registrieren...' : 'Registrieren'}
            </Button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Bereits registriert?{' '}
              <Link to="/login" className={styles.link}>
                Zum Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;