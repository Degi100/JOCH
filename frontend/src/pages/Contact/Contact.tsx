import { useState, FormEvent } from 'react';
import { contactService } from '../../services/contact.service';
import Input from '../../components/Input/Input';
import TextArea from '../../components/TextArea/TextArea';
import Button from '../../components/Button/Button';
import styles from './Contact.module.scss';

/**
 * Contact Page - Contact form for booking and inquiries
 *
 * Features:
 * - Hero section
 * - Contact form with validation
 * - Success/error messages
 * - Social media links
 */
export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Nachricht ist erforderlich';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Nachricht muss mindestens 10 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      await contactService.send(formData);
      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Error sending message:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Kontakt</h1>
          <p className={styles.subtitle}>
            Habt ihr Fragen, wollt uns buchen oder einfach mal Hallo sagen?
            <br />
            Wir freuen uns auf eure Nachricht!
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.formSection}>
            <div className={styles.formWrapper}>
              <h2 className={styles.formTitle}>Schreib uns</h2>

              <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Dein Name"
                  disabled={isSubmitting}
                />

                <Input
                  label="E-Mail *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="deine@email.de"
                  disabled={isSubmitting}
                />

                <Input
                  label="Betreff"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="z.B. Booking-Anfrage"
                  disabled={isSubmitting}
                />

                <TextArea
                  label="Nachricht *"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  error={errors.message}
                  placeholder="Deine Nachricht an uns..."
                  rows={6}
                  disabled={isSubmitting}
                  maxLength={1000}
                  showCharCount
                />

                {submitStatus === 'success' && (
                  <div className={styles.successMessage}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <p>
                      Danke für deine Nachricht! Wir melden uns so schnell wie möglich bei
                      dir.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className={styles.errorMessage}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <p>
                      Fehler beim Senden der Nachricht. Bitte versuche es später erneut.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Nachricht senden
                </Button>
              </form>
            </div>

            {/* Booking Info */}
            <aside className={styles.socialSection}>
              <div className={styles.infoBox}>
                <h4>Booking</h4>
                <p>
                  Für Booking-Anfragen nutzt gerne das Kontaktformular oder schreibt uns
                  direkt per E-Mail.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}