'use client';

import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import JapaneseBackground from '../../components/japanese/JapaneseBackground';
import SiteNavbar from '../../components/navbar/SiteNavbar';

const faqs = [
  {
    question: "How To Contribute",
    answer: (
      <>
      Here is a video guide on how to contribute
      <div className="flex flex-col items-start gap-4 mt-4">
      {/* Video */}
      <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10">
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
          rounded-lg bg-red-600/90 px-4 py-2
          text-sm font-semibold text-white
          shadow-md
          transition-all
          hover:bg-red-500 hover:shadow-lg
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
          className="text-[#e9a7b2] hover:text-[#fff4ed] underline transition-colors"
        >
          Unstop
        </a>{' '}
        and on our own{' '}
        <a
          href="https://events.geekhaven.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e9a7b2] hover:text-[#fff4ed] underline transition-colors"
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
          className="text-[#e9a7b2] hover:text-[#fff4ed] underline transition-colors"
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
    <JapaneseBackground variant="faq">
      <SiteNavbar />
      
      <Box pt="160px" pb="100px" px={{ base: '24px', md: '80px' }} maxW="1200px" mx="auto" w="100%">
        <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'flex-start', lg: 'flex-start' }} gap="60px">
          
          <Box flex="1" maxW="500px">
            <Text fontSize="14px" fontWeight="700" letterSpacing="0.1em" color="rgba(255,255,255,0.6)" mb="16px" textTransform="uppercase">
              GET ANSWERS
            </Text>
            <Text fontSize={{ base: '40px', md: '56px' }} fontWeight="400" lineHeight="1.1" mb="24px" className="text-sakura-gradient">
              Frequently Asked Questions
            </Text>
            <Text fontSize="16px" color="rgba(255,255,255,0.7)" lineHeight="1.6">
              Everything you need to know about OPENCODE 2026.
            </Text>
          </Box>

          <Box flex="1" w="100%" maxW="600px" display="flex" flexDirection="column" gap="16px">
            {visibleFaqs.map((faq, idx) => {
              const globalIndex = start + idx;
              const isOpen = openIndex === globalIndex;

              return (
                <Box
                  key={globalIndex}
                  className="glass-panel"
                  p="20px 24px"
                  transition="all 0.3s ease"
                  bg={isOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'}
                  border={isOpen ? '1px solid rgba(233,167,178,0.3)' : '1px solid rgba(255,255,255,0.05)'}
                >
                  <button
                    onClick={() => toggle(globalIndex)}
                    aria-expanded={isOpen} 
                    className="w-full flex justify-between gap-6 text-left items-center"
                  >
                    <Text fontSize="16px" fontWeight="500" color={isOpen ? '#ffffff' : 'rgba(255,255,255,0.9)'}>
                      {faq.question}
                    </Text>
                    <Box 
                      color={isOpen ? '#e9a7b2' : 'rgba(255,255,255,0.5)'}
                      transition="transform 0.3s"
                      transform={isOpen ? 'rotate(180deg)' : 'none'}
                    >
                      <ArrowDown size={18} />
                    </Box>
                  </button>

                  <Box
                    overflow="hidden"
                    transition="all 0.3s ease-in-out"
                    maxH={isOpen ? '1000px' : '0px'}
                    opacity={isOpen ? 1 : 0}
                    mt={isOpen ? '16px' : '0px'}
                  >
                    <Text fontSize="15px" color="rgba(255,255,255,0.7)" lineHeight="1.6">
                      {faq.answer}
                    </Text>
                  </Box>
                </Box>
              );
            })}

            <Flex mt="24px" align="center" gap="16px" justify="flex-end">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full glass-panel disabled:opacity-30 hover:bg-white/10 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <Text fontSize="14px" color="rgba(255,255,255,0.5)" fontWeight="500">
                Page {page} of {totalPages}
              </Text>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full glass-panel disabled:opacity-30 hover:bg-white/10 transition"
              >
                <ChevronRight size={18} />
              </button>
            </Flex>
          </Box>
          
        </Flex>
      </Box>
    </JapaneseBackground>
  );
};

export default OpenCodeFAQ;

