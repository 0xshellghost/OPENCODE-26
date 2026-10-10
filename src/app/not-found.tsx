'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import ThemeToggle from 'components/japanese/ThemeToggle';

export default function NotFound() {
  return (
    <div className="japanese-page flex flex-col min-h-screen items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="oc-landing-theme absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        <h1 className="text-[120px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-[var(--accent)] to-[var(--bg)] font-serif tracking-tighter opacity-80 mb-4 select-none">
          404
        </h1>
        
        <h2 className="text-2xl font-serif mb-4 text-[var(--text)]">
          Lost in the Cherry Blossoms
        </h2>
        
        <p className="text-[var(--muted)] mb-10 leading-relaxed max-w-md mx-auto">
          The path you are looking for seems to have vanished like petals in the wind. Let&apos;s guide you back to the start.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] hover:bg-[var(--card-soft)] transition-colors text-sm font-medium w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium w-full sm:w-auto justify-center"
          >
            <Home size={16} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
