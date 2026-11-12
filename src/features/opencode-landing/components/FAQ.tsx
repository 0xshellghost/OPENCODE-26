import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative py-24 bg-[#07131F] border-b border-[#AEBCC7]/15 scroll-mt-20 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-[#58B99A]/30 bg-[#102535] px-6 py-12 sm:px-12 sm:py-16 shadow-[0_10px_45px_-15px_rgba(88,185,154,0.2)]">

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#58B99A]/10 border border-[#58B99A]/25 text-[#58B99A] mb-6">
            <MessageCircle size={24} />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#F4F1E8] mb-4">
            Got Questions?
          </h2>

          <p className="text-base sm:text-lg text-[#AEBCC7] max-w-xl mx-auto leading-relaxed mb-8">
            From getting started with open source to making your first
            contribution, find everything you need to know on our FAQ page.
          </p>

          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-[#07131F] bg-[#58B99A] hover:bg-[#B8E5D5] transition-all duration-300 shadow-lg group"
          >
            Explore All FAQs
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
