'use client';

import { PropsWithChildren, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import { useAuth } from 'contexts/AuthContext';

export default function UserLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const auth = useAuth();
  useEffect(() => { auth.check_login(); }, [auth]);
  const variant = pathname.includes('/profile') ? 'profile' : pathname.includes('/milestones') ? 'milestones' : pathname.includes('/winners') ? 'winners' : pathname.includes('/leaderboard') ? 'leaderboard' : 'events';

  return (
    <JapaneseBackground variant={variant}>
      <SiteNavbar />
      <main className="oc-main" id="main-content">{children}</main>
      <footer className="oc-footer"><span>OPENCODE 2026 <span className="oc-footer-dot">/</span> Built together. Open to everyone.</span><Link href="/faq">A little guidance <ArrowUpRight size={14} /></Link></footer>
    </JapaneseBackground>
  );
}
