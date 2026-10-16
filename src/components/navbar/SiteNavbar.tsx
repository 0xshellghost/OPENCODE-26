'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X, UserRound, Flower2 } from 'lucide-react';
import { useAuth } from 'contexts/AuthContext';
import ThemeToggle from 'components/japanese/ThemeToggle';
import SakuraToggle from 'components/common/SakuraToggle';
import OpenCodeLogo from 'components/common/OpenCodeLogo';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/user/home' },
  { label: 'Leaderboard', href: '/user/leaderboard' },
  { label: 'RPlace Canvas', href: '/user/rplace' },
  { label: 'FAQ', href: '/faq' },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`oc-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="oc-navbar-inner">
        <Link href="/" className="oc-brand" aria-label="OpenCode home">
          <OpenCodeLogo width={30} height={30} className="oc-brand-mark" />
          <span>OPENCODE <small>2026</small></span>
        </Link>
        <nav className="oc-desktop-nav" aria-label="Main navigation">
          {navigation.map(({ label, href }) => <Link key={href} href={href} aria-current={(href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'page' : undefined}>{label}</Link>)}
        </nav>
        <div className="oc-nav-actions">
          <SakuraToggle />
          <ThemeToggle />
          <span className="oc-nav-divider" />
          <Link className="oc-nav-signin" href={isLoggedIn ? '/user/profile' : '/auth/sign-in'}>
            {isLoggedIn ? <><UserRound size={16} /> Profile</> : <>Sign in <ArrowUpRight size={15} /></>}
          </Link>
          <button type="button" className="oc-icon-button oc-mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            <div style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)', transform: open ? 'rotate(90deg)' : 'rotate(0)' }}>
              {open ? <Flower2 size={20} /> : <Menu size={20} />}
            </div>
          </button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" className="oc-mobile-nav" aria-label="Mobile navigation">
        {[...navigation, { label: 'Winners', href: '/user/winners' }, { label: 'Milestones', href: '/user/milestones' }, { label: 'Repositories', href: '/user/repos' }].map(({ label, href }) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? 'page' : undefined}>{label}<ArrowUpRight size={14} /></Link>)}
      </nav>}
    </header>
  );
}
