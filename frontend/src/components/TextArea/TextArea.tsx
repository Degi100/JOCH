import { TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './TextArea.module.scss';

/**
 * TextArea component props
 */
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * TextArea label
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below textarea
   */
  helperText?: string;

  /**
   * Full width textarea
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Show character count
   * @default false
   */
  showCharCount?: boolean;
}

/**
 * Reusable TextArea component with label and error handling
 *
 * @example
 * ```tsx
 * <TextArea
 *   label="Message"
 *   value={message}
 *   onChange={(e) => setMessage(e.target.value)}
 *   rows={5}
 *   error={errors.message}
 * />
 * ```
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      showCharCount = false,
      className = '',
      id,
      rows = 4,
      value,
      maxLength,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const textareaId =
      id || `textarea-${Math.random().toString(36).substring(2, 11)}`;

    const wrapperClasses = [
      styles.textareaWrapper,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [styles.textarea, error && styles.error]
      .filter(Boolean)
      .join(' ');

    // Character count
    const currentLength = value ? String(value).length : 0;

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}> *</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          rows={rows}
          value={value}
          maxLength={maxLength}
          {...props}
        />

        <div className={styles.footer}>
          <div className={styles.messages}>
            {error && <span className={styles.errorText}>{error}</span>}
            {!error && helperText && (
              <span className={styles.helperText}>{helperText}</span>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className={styles.charCount}>
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
