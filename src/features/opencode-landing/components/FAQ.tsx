"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { faqData, FAQItem } from "../data/faqData";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import BlurText from "./BlurText";

const SafeAnimatePresence = AnimatePresence as React.FC<React.PropsWithChildren<any>>;

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>("eligibility");

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative py-24 bg-[#07131F] border-b border-[#AEBCC7]/15 scroll-mt-20 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5]"
          >
            Frequently Asked Questions
          </h2>

          <div className="mt-4">
            <BlurText
              text="Quick answers to common questions about participating, submitting pull requests, and climbing the leaderboard."
              className="text-base sm:text-lg text-[#AEBCC7] max-w-2xl mx-auto leading-relaxed"
              delay={25}
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq: FAQItem) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-[#AEBCC7]/15 bg-[#102535] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[#58B99A]/45 hover:shadow-[0_10px_35px_-15px_rgba(7,19,31,0.8)]"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-[#F4F1E8] pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-1 rounded-full bg-[#0B1C2A] text-[#58B99A] border border-[#AEBCC7]/15 shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <SafeAnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-6 pt-1 text-sm sm:text-base text-[#AEBCC7] leading-relaxed border-t border-[#AEBCC7]/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </SafeAnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Subtle, discoverable link to the full dedicated FAQ & guide page */}
        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#AEBCC7] hover:text-[#F4F1E8] bg-[#102535]/60 hover:bg-[#102535] border border-[#AEBCC7]/20 hover:border-[#58B99A]/50 backdrop-blur-md transition-all duration-300 shadow-md group"
          >
            <span>Have more questions? View the full FAQ and guide</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#58B99A] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
