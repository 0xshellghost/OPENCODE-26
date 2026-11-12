import { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';

export default function RegistrationField({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  type = 'text',
  autoComplete,
  full = false,
  list,
  hasError = false,
  error,
  readOnly = false,
  min,
  max,
}: {
  name: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  options?: string[];
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  full?: boolean;
  list?: string;
  hasError?: boolean;
  error?: string;
  readOnly?: boolean;
  min?: number;
  max?: number;
}) {
  const invalid = hasError || Boolean(error);
  const errorStyle = invalid
    ? {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 1px #ef4444',
      }
    : undefined;

  return (
    <label className={`oc-field${full ? ' oc-field-full' : ''}`} htmlFor={`register-${name}`}>
      <span style={{ color: invalid ? '#f87171' : undefined }}>
        {label} <span aria-hidden="true" style={{ color: invalid ? '#ef4444' : 'var(--accent)' }}>*</span>
      </span>
      {options ? (
        <select
          id={`register-${name}`}
          name={name}
          value={value}
          onChange={onChange}
          style={errorStyle}
          aria-invalid={invalid}
          aria-describedby={error ? `register-${name}-error` : undefined}
        >
          <option value="">Choose an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`register-${name}`}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          list={list}
          style={errorStyle}
          readOnly={readOnly}
          min={min}
          max={max}
          aria-invalid={invalid}
          aria-describedby={error ? `register-${name}-error` : undefined}
        />
      )}
      {error && (
        <small id={`register-${name}-error`} role="alert" style={{ color: '#fca5a5', lineHeight: 1.4 }}>
          {error}
        </small>
      )}
    </label>
  );
}

