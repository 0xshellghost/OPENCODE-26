'use client';

import { ArrowRight, Github, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import OpenCodeExperience from '../opencode/OpenCodeExperience';
import ThemeToggle from 'components/japanese/ThemeToggle';

const GITHUB_LOGIN_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/github`;

const navigation = [
  { label: 'Leaderboard', href: '/user/leaderboard' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Sign In with GitHub', href: GITHUB_LOGIN_URL },
];

export default function LandingPage() {
  return (
    <>
      <OpenCodeExperience
        id="opencode"
        ctaLabel="Explore the leaderboard"
        ctaHref="/user/leaderboard"
        skipTargetId="opencode-content"
        quality="auto"
        navigation={navigation}
      />

      <div className="oc-landing-theme"><ThemeToggle /></div>

      {/* Content section below the cinematic hero */}
      <section
        id="opencode-content"
        tabIndex={-1}
        className="relative z-10 flex justify-center w-full px-5 sm:px-8 md:px-20 py-20"
        style={{ background: 'var(--bg)' }}
      >
        <aside className="glass-panel flex flex-col w-full max-w-[420px] p-6" style={{ color: 'var(--text)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e9a7b2] to-[#fff4ed] flex items-center justify-center">
              <Image
                src="/img/avatars/opencodelogo.png"
                alt="OpenCode"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">OpenCode</h3>
              <p className="text-xs text-[var(--muted)]">
                Join projects, earn stars, and grow.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 text-sm">
            <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
              <div className="text-xs text-[var(--muted)]">Participants</div>
              <div className="mt-1 font-semibold flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> 1.2k
              </div>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
              <div className="text-xs text-[var(--muted)]">Repos</div>
              <div className="mt-1 font-semibold flex items-center justify-center gap-2">
                <Github className="w-4 h-4" /> 165
              </div>
            </div>
          </div>

          {/* <div className="mt-4 p-3 rounded-lg bg-white/3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[var(--muted)]">Top Projects</div>
              <div className="text-xs text-white/60">Updated</div>
            </div>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-white/6 flex items-center justify-center text-xs">#</span>
                  <span>Web Starter</span>
                </div>
                <div className="text-[var(--muted)] flex items-center gap-1"><Star className="w-4 h-4 text-yellow-300"/> 1.5k</div>
              </li>
              <li className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-white/6 flex items-center justify-center text-xs">#</span>
                  <span>Design System</span>
                </div>
                <div className="text-[var(--muted)] flex items-center gap-1"><Star className="w-4 h-4 text-yellow-300"/> 980</div>
              </li>
            </ul>
          </div> */}

          <div className="mt-6 flex gap-2">
            <Link href="https://github.com/opencodeiiita" className="w-full">
              <button className="w-full px-3 py-2 rounded-full bg-gradient-to-r from-[#e9a7b2] to-[#fff4ed] font-semibold text-[#211d27] flex items-center justify-center gap-2">
                Explore Projects <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
