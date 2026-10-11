'use client';

import { useSakura } from 'contexts/SakuraContext';
import { Flower2 } from 'lucide-react';
import styles from './sakura-toggle.module.css';

export default function SakuraToggle() {
  const { enabled, toggle } = useSakura();

  return (
    <button
      type="button"
      className={`${styles.toggle} ${enabled ? styles.active : ''}`}
      onClick={toggle}
      aria-label={enabled ? 'Disable sakura petals' : 'Enable sakura petals'}
      title={enabled ? 'Disable sakura petals' : 'Enable sakura petals'}
    >
      <Flower2 size={14} className={styles.icon} />
    </button>
  );
}
