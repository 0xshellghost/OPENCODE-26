"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail, Phone, ExternalLink } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="footer"
      className="relative bg-[#0B1C2A] text-[#AEBCC7] pt-20 pb-12 border-t border-[#AEBCC7]/15 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-[#AEBCC7]/10">
          {/* Col 1: About OpenCode & GeekHaven */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#58B99A] via-[#B8E5D5] to-[#102535] p-[2px]">
                <div className="bg-[#07131F] rounded-full flex items-center justify-center w-full h-full">
                  <Image
                    src="/logo_rb-min.png"
                    width={28}
                    height={28}
                    alt="OpenCode Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5] tracking-tight">
                OpenCode 2026
              </span>
            </Link>

            <p className="text-sm text-[#AEBCC7] leading-relaxed">
              Organized by <span className="text-[#F4F1E8] font-medium">GeekHaven</span>, the official technical society of IIIT Allahabad. Empowering student developers to master production open source and connect with world-class engineering teams.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-base font-bold text-[#F4F1E8] mb-5 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-[#AEBCC7]">
              <li>
                <a href="#about" className="hover:text-[#B8E5D5] transition-colors">
                  About OpenCode
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#B8E5D5] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#B8E5D5] transition-colors">
                  Tracks &amp; Repositories
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-[#B8E5D5] transition-colors">
                  Community Testimonials
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#B8E5D5] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a
                  href="https://drive.google.com/file/d/1LQJai-gcyf6AvzlW06aw7WJ8qZUpwN4P/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B8E5D5] transition-colors inline-flex items-center gap-1"
                >
                  Code of Conduct
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Inquiries */}
          <div>
            <h3 className="text-base font-bold text-[#F4F1E8] mb-5 uppercase tracking-wider">
              Contact &amp; Inquiries
            </h3>
            <ul className="space-y-3 text-sm text-[#AEBCC7]">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#58B99A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#F4F1E8]">Abdul Azeem</p>
                  <a href="tel:+917217492629" className="text-xs text-[#718394] hover:text-[#B8E5D5]">
                    +91 721 749 2629
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#58B99A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#F4F1E8]">Adith Reganti</p>
                  <a href="tel:+918618275578" className="text-xs text-[#718394] hover:text-[#B8E5D5]">
                    +91 861 827 5578
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#58B99A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#F4F1E8]">Anubhav Sharma</p>
                  <a href="tel:+919855488413" className="text-xs text-[#718394] hover:text-[#B8E5D5]">
                    +91 98554 88413
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 pt-2 border-t border-[#AEBCC7]/10">
                <Mail className="w-4 h-4 text-[#58B99A] shrink-0" />
                <a href="mailto:geekhaven@iiita.ac.in" className="text-xs text-[#B8E5D5] hover:underline">
                  geekhaven@iiita.ac.in
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Socials */}
          <div className="space-y-5">
            <h3 className="text-base font-bold text-[#F4F1E8] uppercase tracking-wider">
              Community &amp; Socials
            </h3>

            <div className="space-y-2.5 text-sm text-[#AEBCC7]">
              <a
                href="https://discord.gg/SxBATvUPnC"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#B8E5D5] transition-colors"
              >
                Discord Community
              </a>
              <a
                href="https://github.com/opencodeiiita"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#B8E5D5] transition-colors"
              >
                GitHub Organizations
              </a>
              <a
                href="https://twitter.com/geekhaveniiita"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#B8E5D5] transition-colors"
              >
                Twitter / X
              </a>
              <a
                href="https://www.linkedin.com/company/geekhaven-iiita"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#B8E5D5] transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/geekhaven_iiita/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#B8E5D5] transition-colors"
              >
                Instagram
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#B8E5D5] hover:text-[#A3DAC7] pt-2 border-t border-[#AEBCC7]/10 cursor-pointer transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Back to top
            </button>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#718394] gap-4">
          <p>© 2026 OpenCode • Built with passion by Team GeekHaven, IIIT Allahabad.</p>
          <p className="text-[#718394]/80">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
