'use client';

import { ArrowDown, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    question: "How To Contribute",
    answer: (
      <>
      Here is a video guide on how to contribute
      <div className="flex flex-col items-center gap-4 mt-4">
      {/* Video */}
      <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe
          src="https://www.youtube.com/embed/rThCmK0iBYw?controls=1&rel=0&modestbranding=1"
          title="How To Contribute"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a
        href="https://www.youtube.com/watch?v=rThCmK0iBYw"
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex items-center gap-2
          rounded-lg bg-red-600 px-4 py-2
          text-sm font-semibold text-white
          shadow-md
          transition-all
          hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5
          active:translate-y-0
        "
      >
        ▶ Watch on YouTube
      </a>
    </div>
      </>
       
    )
  },
  {
    question: 'What is OpenCode?',
    answer:
      'OpenCode is a month-long open-source program where students collaborate on real-world projects with mentor guidance.',
  },
  {
    question: 'Who can participate?',
    answer:
      'Anyone interested in development can participate, regardless of experience level.',
  },
  {
    question: 'Is OpenCode free?',
    answer: 'Yes, OpenCode is completely free.',
  },
  {
    question: 'Do I need prior open-source experience?',
    answer: 'No, mentors will help you get started.',
  },
  {
    question: 'What kind of projects are available?',
    answer:
      'Projects are from the following domains - AI-ML , Web Development , Add Development , Cyber-Security ,Block-Chain , Competetive Programming , Design , FOSS',
  },
  {
    question: 'How do I get started?',
    answer: (
      <>
        You need to register through{' '}
        <a
          href="https://bit.ly/RegisterAtOpencode25"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Unstop
        </a>{' '}
        and on our own{' '}
        <a
          href="https://events.geekhaven.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          website
        </a>
        .
      </>
    ),
  },
  {
    question: 'Can I work in a team?',
    answer: 'No, each issue is meant to be solved individually.',
  },
  {
    question: 'Is mentorship provided?',
    answer: 'Yes, maintainers actively review PRs and guide contributors.',
  },
  {
    question: 'Do I get certificates?',
    answer: 'Top contributors receive certificates and recognition.',
  },
  {
    question: 'How much time is required?',
    answer: 'Even a few hours per week is enough.',
  },
  {
    question: 'How do I get started?',
    answer: (
     <>
      Sign in, join our {' '}
      <a
          href="https://discord.com/channels/885149696249708635/885151791329722448"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
      > Discord</a>
      , wait for issues to be raised, and pick an issue.
    </>
    )
  },
  {
    question: 'Can I contribute to multiple projects?',
    answer: 'Yes, you can contribute to multiple repositories.',
  },
  {
    question: 'Are beginners really supported?',
    answer: 'Yes, beginner-friendly issues are clearly marked.',
  },
  {
    question: 'Is OpenCode remote?',
    answer: 'Yes, the entire program is remote.',
  },
  {
    question: 'What tech stacks are used?',
    answer:
      'Tech stack for each project is mentioned in the ReadMe for each project.',
  },
];

const ITEMS_PER_PAGE = 6;

const OpenCodeFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(faqs.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visibleFaqs = faqs.slice(start, start + ITEMS_PER_PAGE);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="relative min-h-screen bg-[#211d27] text-white overflow-hidden">
      <header className="w-full border-b border-white/10">
        <div className="w-[90%] max-w-[1440px] mx-auto flex items-center justify-between py-6">
          <span className="text-xl font-semibold">OpenCode</span>

          <Link
            href="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Go back
          </Link>
        </div>
      </header>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-[90%] max-w-[1440px] mx-auto py-28 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-24">
        <div>
          <h2 className="text-[3rem] sm:text-[4rem] font-normal leading-tight max-w-3xl">
            Frequently Asked
            <br />
            Questions
          </h2>

          <p className="mt-6 text-white/70 max-w-xl">
            Everything you need to know before joining OpenCode.
          </p>

          <div className="mt-20 flex flex-col gap-8 max-w-3xl">
            {visibleFaqs.map((faq, idx) => {
              const globalIndex = start + idx;
              const isOpen = openIndex === globalIndex;

              return (
                <div
                  key={globalIndex}
                  className={`border-b border-white/15 pb-6 transition-colors ${
                    isOpen ? 'bg-white/5 rounded-xl px-5 -mx-5' : ''
                  }`}
                >
                  <button
                    onClick={() => toggle(globalIndex)}
                    aria-expanded={isOpen} 
                    className="w-full flex justify-between gap-6 text-left"
                  >
                    <span className="text-lg sm:text-xl font-medium mt-4">
                      {faq.question}
                    </span>
                    <ArrowDown
                      className={`transition-transform duration-300 mt-4 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100 mt-4'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden text-white/70 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-full border border-white/20 disabled:opacity-40 hover:bg-white/10 transition"
            >
              <ChevronLeft />
            </button>

            <span className="text-white/70">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-full border border-white/20 disabled:opacity-40 hover:bg-white/10 transition"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div className="relative w-[320px] h-[320px] opacity-90">
            <Image
              src="/Logo/OpenCode-White.png"
              alt="OpenCode Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpenCodeFAQ;
