'use client';

import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import FAQAccordion from '../../components/japanese/FAQAccordian';

const faqs = [
  { question: 'What is OpenCode?', answer: 'OpenCode is a month-long open-source program where students collaborate on real-world projects with mentor guidance.' },
  { question: 'Who can participate?', answer: 'Anyone interested in development can participate, regardless of experience level.' },
  { question: 'Is there a registration fee?', answer: 'No. OpenCode is completely free to participate in.' },
  { question: 'Do I need open-source experience?', answer: 'Not at all. Mentors and maintainers will help you get started, and beginner-friendly issues are clearly marked.' },
  { question: 'How do I make my first contribution?', answer: <><p>Our video guide walks you through making your first contribution.</p><div className="relative w-full aspect-video rounded-lg overflow-hidden mt-4"><iframe src="https://www.youtube.com/embed/rThCmK0iBYw?rel=0" title="How to contribute to OpenCode" className="w-full h-full border-0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=rThCmK0iBYw" target="_blank" rel="noopener noreferrer">Watch the contribution guide on YouTube</a></> },
  { question: 'Can I contribute to multiple projects?', answer: 'Yes, you can contribute to multiple repositories and explore different areas of open source.' },
  { question: 'Will there be certificates?', answer: 'Top contributors receive certificates and recognition for their contributions.' },
  { question: 'What kinds of projects are available?', answer: 'Projects span AI and machine learning, web development, app development, cybersecurity, blockchain, competitive programming, design, and free and open-source software.' },
  { question: 'How do I register?', answer: <>Register through <a href="https://bit.ly/RegisterAtOpencode25" target="_blank" rel="noopener noreferrer">Unstop</a> and on <Link href="/auth/sign-in">our website</Link>. Then join the community to get started.</> },
  { question: 'Can I work in a team?', answer: 'Each issue is intended to be solved individually. You can still learn from the community and ask maintainers for guidance.' },
  { question: 'Is mentorship provided?', answer: 'Yes. Maintainers actively review pull requests and guide contributors throughout the program.' },
  { question: 'How much time should I commit?', answer: 'Even a few hours per week is enough. Find an issue that fits your interests and work at a sustainable pace.' },
  { question: 'Where can I find the community?', answer: <>Sign in and join our <a href="https://discord.com/channels/885149696249708635/885151791329722448" target="_blank" rel="noopener noreferrer">Discord community</a>. Watch for new issues and pick one that interests you.</> },
  { question: 'Is OpenCode remote?', answer: 'Yes. The entire program is remote, so you can contribute from wherever you are.' },
  { question: 'Which tech stacks are used?', answer: 'Each project lists its tech stack and setup instructions in its README. Explore the repositories to find a project that suits you.' },
];

export default function OpenCodeFAQ() {
  return <JapaneseBackground variant="faq">
    <SiteNavbar />
    <main className="oc-faq-layout">
      <header className="oc-faq-intro">
        <p className="oc-eyebrow"><span />A LITTLE GUIDANCE</p>
        <h1 className="oc-faq-heading">Good questions.<br />Clear beginnings.</h1>
        <p className="oc-description">Everything you need to know about OpenCode. Your next chapter starts with a little curiosity.</p>
        <div className="oc-note"><MessageCircle size={21} strokeWidth={1.5} /><div><a href="https://discord.com/channels/885149696249708635/885151791329722448" target="_blank" rel="noopener noreferrer">Let&apos;s talk on Discord <ArrowUpRight size={13} style={{ display: 'inline' }} /></a><p>Good people. Always happy to help.</p></div></div>
      </header>
      <FAQAccordion items={faqs} />
    </main>
    <footer className="oc-footer"><span>OPENCODE 2026 <span className="oc-footer-dot">/</span> Learn. Contribute. Belong.</span><Link href="/user/home">Explore events <ArrowUpRight size={14} /></Link></footer>
  </JapaneseBackground>;
}
