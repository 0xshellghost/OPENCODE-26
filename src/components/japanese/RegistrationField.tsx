import { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';

export default function RegistrationField({ name, label, value, onChange, options, placeholder, type = 'text', autoComplete, full = false }: {
  name: string; label: string; value: string; onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>; options?: string[]; placeholder?: string; type?: HTMLInputTypeAttribute; autoComplete?: string; full?: boolean;
}) {
  return (
    <label className={`oc-field${full ? ' oc-field-full' : ''}`} htmlFor={`register-${name}`}>
      <span>{label} <span aria-hidden="true" style={{ color: 'var(--accent)' }}>*</span></span>
      {options ? <select id={`register-${name}`} name={name} value={value} onChange={onChange} required><option value="">Choose an option</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select> : <input id={`register-${name}`} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required />}
    </label>
  );
}
