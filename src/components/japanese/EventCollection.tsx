'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarDays,
  Trophy,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@chakra-ui/react';
import ClickSpark from '../reactbits/ClickSpark';
import AnimatedContent from '../reactbits/AnimatedContent';
import GradientText from '../reactbits/GradientText';
import PageHeading from './PageHeading';
import { useFeatures } from 'contexts/FeaturesContext';
import { resolveImageUrl, getEventCoverImage, getEventLogoImage } from 'utils/eventImages';

type Event = {
  name: string;
  isFlagship?: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
  logoImageURL?: string;
  logoImageUrl?: string;
  logoImage?: string;
  coverImageURL?: string;
  coverImageUrl?: string;
  coverImages?: (string | { url?: string; imageUrl?: string })[];
  coverImagesURL?: (string | { url?: string; imageUrl?: string })[];
  coverImageURLs?: string[];
  image?: string;
  imageUrl?: string;
  [key: string]: any;
};

function formatEventDates(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 'Dec 2025 – Jan 2026';
  try {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Dec 2025 – Jan 2026';
    const sMonth = s.toLocaleString('en-US', { month: 'short' });
    const eMonth = e.toLocaleString('en-US', { month: 'short' });
    const sYear = s.getFullYear();
    const eYear = e.getFullYear();
    if (sYear === eYear) {
      return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${sYear}`;
    }
    return `${sMonth} ${s.getDate()}, ${sYear} – ${eMonth} ${e.getDate()}, ${eYear}`;
  } catch {
    return 'Dec 2025 – Jan 2026';
  }
}

function getEventStatus(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return { label: 'Live Now', type: 'live' };
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return { label: 'Concluded', type: 'concluded' };
  if (now < start) return { label: 'Upcoming', type: 'upcoming' };
  return { label: 'Live Now', type: 'live' };
}

function getEventTrack(name: string, description?: string): string {
  const text = `${name} ${description || ''}`.toLowerCase();
  if (text.includes('ai') || text.includes('vision') || text.includes('kuroshio')) return 'AI / ML Sprint';
  if (text.includes('hack') || text.includes('north')) return 'Hackathon';
  if (text.includes('web3') || text.includes('contract') || text.includes('solana')) return 'Web3 & Governance';
  if (text.includes('ctf') || text.includes('security') || text.includes('cybershield')) return 'Security & CTF';
  if (text.includes('mobile') || text.includes('flutter')) return 'Mobile Dev';
  if (text.includes('game') || text.includes('forge')) return 'Game Dev';
  if (text.includes('bytecamp') || text.includes('algo')) return 'Systems & Algorithms';
  if (text.includes('cloud') || text.includes('kubernetes')) return 'Cloud & DevOps';
  if (text.includes('design')) return 'Design & UI/UX';
  return 'Open Source Sprint';
}

function EventCardImage({
  event,
  fallbackScene,
}: {
  event: Event;
  fallbackScene: string;
}) {
  const fallbackUrl = `/images/${fallbackScene}.png`;

  const resolvedUrl = useMemo(() => {
    const rawCover = getEventCoverImage(event);
    return resolveImageUrl(rawCover, fallbackUrl);
  }, [event, fallbackUrl]);

  const [imgSrc, setImgSrc] = useState(resolvedUrl);

  useEffect(() => {
    setImgSrc(resolvedUrl);
  }, [resolvedUrl]);

  return (
    <Image
      src={imgSrc}
      alt={event.name ? `${event.name} cover` : 'Event cover'}
      fill
      sizes="(max-width: 480px) 100vw, (max-width: 1100px) 50vw, 33vw"
      unoptimized
      onError={() => {
        if (imgSrc !== fallbackUrl) {
          setImgSrc(fallbackUrl);
        }
      }}
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

function FlagshipCard({
  event,
  leaderboard = false,
}: {
  event: Event;
  leaderboard?: boolean;
}) {
  const title = useMemo(() => {
    try {
      return decodeURIComponent(event.name || '');
    } catch {
      return event.name;
    }
  }, [event.name]);

  const track = getEventTrack(event.name, event.description);
  const status = getEventStatus(event.startDate, event.endDate);
  const dates = formatEventDates(event.startDate, event.endDate);

  const bannerUrl = resolveImageUrl(
    getEventCoverImage(event),
    '/images/kyoto-evening.png',
  );
  const logoUrl = resolveImageUrl(getEventLogoImage(event));
  const Icon = leaderboard ? Trophy : CalendarDays;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-ping" />
        <span className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)] font-mono">
          Featured Flagship Arena
        </span>
      </div>

      <article
        className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* Generous Banner image giving the cover artwork maximum spotlight */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-[var(--bg)]">
          <Image
            src={bannerUrl}
            alt={event.name ? `${event.name} banner` : 'Event banner'}
            fill
            unoptimized
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

          {/* Floating Category & Status Badges */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-5 z-10 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/75 text-slate-100 border border-white/20 shadow-md backdrop-blur-md">
              {track}
            </span>
            {status.type === 'live' ? (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-md bg-emerald-950/85 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Now
              </span>
            ) : status.type === 'upcoming' ? (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-md bg-amber-950/85 text-amber-300 border border-amber-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Upcoming
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-md bg-slate-900/85 text-slate-200 border border-slate-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Concluded
              </span>
            )}
          </div>
        </div>

        {/* Compact, streamlined event info bar - minimizes vertical space for maximum banner presence */}
        <div className="p-3.5 sm:px-6 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Logo */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shadow-md overflow-hidden flex items-center justify-center p-1 shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Icon size={20} className="text-[var(--accent)]" />
              )}
            </div>

            {/* Title, Dates & One-line Description */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-0.5">
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                  <GradientText
                    colors={['#B8E5D5', '#F4F1E8', '#58B99A', '#B8E5D5']}
                    lightColors={['#0F766E', '#134E4A', '#0D9488', '#0F766E']}
                    animationSpeed={8}
                  >
                    {title}
                  </GradientText>
                </h3>
                <span className="flex items-center gap-1 text-[11px] sm:text-xs text-[var(--muted)] font-mono">
                  <CalendarDays size={12} className="text-[var(--accent)]" />
                  <span>{dates}</span>
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] line-clamp-1 max-w-2xl">
                {event.description ||
                  'Join thousands of student developers in the premier seasonal open-source sprint.'}
              </p>
            </div>
          </div>

          {/* Action Button & Sprint Indicator */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-[var(--border)] md:border-t-0">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono hidden lg:flex">
              {status.type === 'live' ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[var(--fg)] font-semibold">Active Sprint</span>
                </>
              ) : status.type === 'upcoming' ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[var(--muted)]">Upcoming Sprint</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[var(--muted)]">Sprint Concluded</span>
                </>
              )}
            </div>
            <Link
              href={`/user/leaderboard/${encodeURIComponent(event.name)}`}
              className="px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-all shadow-md group-hover:scale-[1.02] shrink-0"
            >
              <span>
                {leaderboard
                  ? 'View Arena Standings'
                  : status.type === 'concluded'
                  ? 'View Final Standings'
                  : 'Enter Arena & Leaderboard'}
              </span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function EventCollection({
  events,
  loading,
  error,
  retry,
  leaderboard = false,
}: {
  events: Event[];
  loading: boolean;
  error: boolean;
  retry: () => void;
  leaderboard?: boolean;
}) {
  const { features } = useFeatures();
  const scenes = ['kyoto-evening', 'kyoto-garden', 'kyoto-torii'];
  const Icon = leaderboard ? Trophy : CalendarDays;

  // Resolve flagship event: database isFlagship takes precedence, fallback to features config
  const flagship = useMemo(() => {
    const dbFlagship = events.find((e) => e.isFlagship === true);
    if (dbFlagship) return dbFlagship;
    if (!features?.flagshipEvent) return null;
    return (
      events.find(
        (e) => e.name?.toLowerCase() === features.flagshipEvent?.toLowerCase(),
      ) || null
    );
  }, [events, features?.flagshipEvent]);

  // Filter out the flagship event so it isn't duplicated in the grid
  const gridEvents = useMemo(() => {
    if (!flagship) return events;
    return events.filter((e) => e.name !== flagship.name);
  }, [events, flagship]);

  return (
    <ClickSpark sparkColor="rgba(88, 185, 154, 0.75)" sparkSize={6} sparkRadius={26} sparkCount={7}>
      <PageHeading
        eyebrow={leaderboard ? "STANDINGS BY ARENA" : "COMPETITIONS & TRACKS"}
        title={leaderboard ? "Leaderboard Arenas" : "Active Arenas & Challenges"}
        description={
          leaderboard
            ? "Select an arena to view official standings, merged contributions, and top performers."
            : "Explore seasonal open-source sprints, collaborate with maintainers, and climb the official standings across specialized tracks."
        }
      >
        競技会
      </PageHeading>

      {/* Loading Skeleton Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading events" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <Skeleton
              key={n}
              height="380px"
              borderRadius="20px"
              startColor="var(--card-soft)"
              endColor="var(--border)"
            />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel oc-empty" role="status">
          <CalendarDays size={32} />
          <h2>A brief pause in the journey.</h2>
          <p>We couldn&apos;t load the events right now. Please try again in a moment.</p>
          <button className="oc-button oc-button-secondary" onClick={retry}>
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : !events.length ? (
        <div className="glass-panel oc-empty">
          <CalendarDays size={28} />
          <h2>New beginnings are on the way.</h2>
          <p>Events will appear here when they are announced.</p>
        </div>
      ) : (
        /* Dynamic Event Showcase: Flagship Landmark + Curated Grid */
        <div>
          {flagship && <FlagshipCard event={flagship} leaderboard={leaderboard} />}

          {flagship && gridEvents.length > 0 && (
            <div className="flex items-center gap-4 mt-8 mb-5">
              <h4 className="text-xs font-bold tracking-wider uppercase text-[var(--fg)] font-mono opacity-80">
                All Active & Upcoming Tracks
              </h4>
              <div className="flex-1 h-[1px] bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted)] font-mono font-medium">
                {gridEvents.length} more {gridEvents.length === 1 ? 'track' : 'tracks'}
              </span>
            </div>
          )}

          {/* Grid of Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridEvents.map((event, index) => {
              const decodedName = (() => {
                try {
                  return decodeURIComponent(event.name || '');
                } catch {
                  return event.name;
                }
              })();

              const track = getEventTrack(event.name, event.description);
              const status = getEventStatus(event.startDate, event.endDate);
              const dateRange = formatEventDates(event.startDate, event.endDate);
              const isLive = status.type === 'live';
              const cardLogoUrl = resolveImageUrl(getEventLogoImage(event));

              return (
                <AnimatedContent key={event.name} delay={index * 0.04}>
                  <article
                    className={`group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                      isLive ? 'border-t-2 border-t-[var(--accent)]' : ''
                    }`}
                    style={{
                      background: 'var(--surface)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow)',
                    }}
                  >
                    {/* Visual Banner Header */}
                    <div className="relative h-40 w-full overflow-hidden bg-[var(--bg)]">
                      <EventCardImage event={event} fallbackScene={scenes[index % scenes.length]} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />

                      {/* Top Status & Track Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-slate-950/75 text-slate-100 border border-white/20 shadow-sm backdrop-blur-md">
                          {track}
                        </span>

                        {status.type === 'live' ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-emerald-950/85 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Now
                          </span>
                        ) : status.type === 'upcoming' ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-amber-950/85 text-amber-300 border border-amber-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Upcoming
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-sm backdrop-blur-md bg-slate-900/85 text-slate-200 border border-slate-700/60">
                            Concluded
                          </span>
                        )}
                      </div>

                      {/* Event Logo Avatar Badge */}
                      <div className="absolute -bottom-3 left-5 z-10 flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border-2 border-[var(--border-strong)] shadow-lg overflow-hidden flex items-center justify-center p-1">
                          {cardLogoUrl ? (
                            <img
                              src={cardLogoUrl}
                              alt={decodedName}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Icon size={22} className="text-[var(--accent)]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 pt-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Date Indicator */}
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-2 font-mono">
                          <CalendarDays size={13} className="text-[var(--accent)]" />
                          <span>{dateRange}</span>
                        </div>

                        {/* Event Title */}
                        <h3 className="text-xl font-bold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-tight mb-2">
                          {decodedName}
                        </h3>

                        {/* Event Description */}
                        <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-4">
                          {event.description ||
                            'Collaborate with fellow student developers, contribute code, and build impactful software together.'}
                        </p>
                      </div>

                      {/* Clean Action Footer */}
                      <div className="pt-3 border-t border-[var(--border)]">
                        <Link
                          href={`/user/leaderboard/${encodeURIComponent(event.name)}`}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] hover:border-[var(--accent)] transition-all duration-200 shadow-sm"
                        >
                          <span>{leaderboard ? 'View Leaderboard' : 'Explore Event & Standings'}</span>
                          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </AnimatedContent>
              );
            })}
          </div>
        </div>
      )}
    </ClickSpark>
  );
}
