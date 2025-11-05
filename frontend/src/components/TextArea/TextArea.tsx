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
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

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
          {...props}
        />

        {error && <span className={styles.errorText}>{error}</span>}
        {!error && helperText && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
