'use client';

import { PropsWithChildren, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Trophy, Flag, FolderGit2, UserRound, ArrowUpRight, Palette } from 'lucide-react';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import { useAuth } from 'contexts/AuthContext';

const sections = [
  { label: 'Events', href: '/user/home', icon: CalendarDays },
  { label: 'Leaderboard', href: '/user/leaderboard/Opencode', icon: Trophy },
  { label: 'RPlace Canvas', href: '/user/rplace', icon: Palette },
  { label: 'Winners', href: '/user/winners', icon: Trophy },
  { label: 'Milestones', href: '/user/milestones', icon: Flag },
  { label: 'Repositories', href: '/user/repos', icon: FolderGit2 },
  { label: 'Profile', href: '/user/profile', icon: UserRound },
];

export default function UserLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const auth = useAuth();
  useEffect(() => { auth.check_login(); }, [auth]);
  const variant = pathname.includes('/profile') ? 'profile' : pathname.includes('/milestones') ? 'milestones' : pathname.includes('/winners') ? 'winners' : pathname.includes('/leaderboard') ? 'leaderboard' : 'events';

  return (
    <JapaneseBackground variant={variant}>
      <SiteNavbar />
      <div className="oc-community-nav">
        <nav aria-label="Community navigation">
          {sections.map(({ label, href, icon: Icon }) => {
            const isLeaderboard = href.includes('/leaderboard');
            const isActive = isLeaderboard ? pathname?.includes('/leaderboard') : pathname?.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={isActive ? 'page' : undefined}>
                <Icon size={15} />
                <span className="oc-nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>
        <span className="oc-community-label">A SEASON OF POSSIBILITIES</span>
      </div>
      <main className="oc-main" id="main-content">{children}</main>
      <footer className="oc-footer"><span>OPENCODE 2026 <span className="oc-footer-dot">/</span> Built together. Open to everyone.</span><Link href="/faq">A little guidance <ArrowUpRight size={14} /></Link></footer>
    </JapaneseBackground>
  );
}
