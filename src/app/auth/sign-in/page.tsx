'use client';

import { Github, ArrowUpRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import { USE_SEED_DATA, seedDefaultUser } from 'constants/seedData';

export default function SignIn() {
  const handleLoginWithGitHub = () => {
    if (USE_SEED_DATA) {
      localStorage.setItem('token', 'seed-mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(seedDefaultUser));
      window.location.href = `/user/profile/${seedDefaultUser.githubId}`;
      return;
    }
    window.location.assign(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/github`);
  };


  return (
    <JapaneseBackground variant="auth">
      <SiteNavbar />
      <main className="oc-auth-layout">
        <section className="glass-panel oc-auth-card" aria-labelledby="sign-in-title">
          <div className="oc-auth-symbol"><ShieldCheck size={25} strokeWidth={1.4} /></div>
          <p className="oc-eyebrow"><span />YOUR NEXT CHAPTER</p>
          <h1 className="oc-auth-heading" id="sign-in-title">Welcome back.</h1>
          <p className="oc-description">Good to see you again. Sign in to follow your progress, celebrate your contributions, and keep creating.</p>
          <button type="button" className="oc-button" onClick={handleLoginWithGitHub}><Github size={19} />Continue with GitHub<ArrowUpRight size={17} /></button>
          <p className="oc-auth-fineprint">Your GitHub account is your key to OpenCode.<br />One community. Endless possibilities.</p>
          <div className="oc-auth-links">New to open source? <Link href="/faq">Start with our guide.</Link></div>
        </section>
        <aside className="oc-auth-story">
          <span className="oc-japanese-caption" lang="ja">共に創る</span>
          <h2>Great things begin<br />with a small step.</h2>
          <p>A new season of ideas, collaboration, and open-source possibilities. Find your place in the story.</p>
        </aside>
      </main>
    </JapaneseBackground>
  );
}
