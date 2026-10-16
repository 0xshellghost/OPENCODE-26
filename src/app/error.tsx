'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react';
import ThemeToggle from 'components/japanese/ThemeToggle';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in a real app
    console.error('OpenCode Global Error:', error);
  }, [error]);

  return (
    <div className="japanese-page flex flex-col min-h-screen items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="oc-landing-theme absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] p-8 sm:p-12 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-2xl font-serif mb-4 text-[var(--text)]">
          A glitch in the experience
        </h2>
        
        <p className="text-[var(--muted)] mb-4 leading-relaxed">
          Something unexpected happened while rendering this page. We apologize for the interruption.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-left text-red-300 max-h-32 overflow-auto break-all">
            <span className="font-semibold block text-red-400 mb-1">Error Details:</span>
            {error.message}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => reset()}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] hover:bg-[var(--card-soft)] transition-colors text-sm font-medium w-full sm:w-auto justify-center"
          >
            <RefreshCcw size={16} /> Try Again
          </button>
          
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity text-sm font-medium w-full sm:w-auto justify-center"
          >
            <Home size={16} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
