'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  Search,
  Trophy,
  RefreshCw,
  Users,
  Code2,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@chakra-ui/react';
import PageHeading from './PageHeading';
import ShinyText from '../reactbits/ShinyText';
import ClickSpark from '../reactbits/ClickSpark';
import CountUp from '../reactbits/CountUp';
import AnimatedContent from '../reactbits/AnimatedContent';

type Event = {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  logoImageURL?: string;
  logoImageUrl?: string;
  logoImage?: string;
  coverImageURL?: string;
  coverImageUrl?: string;
  coverImages?: (string | { url?: string; imageUrl?: string })[];
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
    let raw: string | undefined;

    if (event.coverImageURL && typeof event.coverImageURL === 'string') {
      raw = event.coverImageURL;
    } else if (event.coverImageUrl && typeof event.coverImageUrl === 'string') {
      raw = event.coverImageUrl;
    } else if (Array.isArray(event.coverImages) && event.coverImages.length > 0) {
      const first = event.coverImages[0];
      if (typeof first === 'string') raw = first;
      else if (first && typeof first === 'object') {
        raw = first.url || first.imageUrl;
      }
    } else if (Array.isArray(event.coverImageURLs) && event.coverImageURLs.length > 0) {
      raw = event.coverImageURLs[0];
    } else if (event.logoImageURL && typeof event.logoImageURL === 'string') {
      raw = event.logoImageURL;
    } else if (event.logoImageUrl && typeof event.logoImageUrl === 'string') {
      raw = event.logoImageUrl;
    } else if (event.logoImage && typeof event.logoImage === 'string') {
      raw = event.logoImage;
    } else if (event.image && typeof event.image === 'string') {
      raw = event.image;
    } else if (event.imageUrl && typeof event.imageUrl === 'string') {
      raw = event.imageUrl;
    }

    if (!raw || typeof raw !== 'string' || !raw.trim()) {
      return fallbackUrl;
    }

    const trimmed = raw.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }

    if (trimmed.startsWith('/images/') || trimmed.startsWith('/img/')) {
      return trimmed;
    }

    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
    if (trimmed.startsWith('/')) {
      return backendUrl ? `${backendUrl}${trimmed}` : trimmed;
    }

    return backendUrl ? `${backendUrl}/${trimmed}` : `/${trimmed}`;
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
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'live' | 'hackathon' | 'opensource' | 'ai'>('all');

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'live', label: 'Live Now' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'opensource', label: 'Open Source Sprints' },
    { id: 'ai', label: 'Systems & AI' },
  ];

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchSearch = `${event.name} ${event.description || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchSearch) return false;

      const track = getEventTrack(event.name, event.description).toLowerCase();
      const status = getEventStatus(event.startDate, event.endDate).type;

      if (activeCategory === 'live') return status === 'live';
      if (activeCategory === 'hackathon') return track.includes('hackathon');
      if (activeCategory === 'opensource') return track.includes('open source');
      if (activeCategory === 'ai') return track.includes('ai') || track.includes('systems');

      return true;
    });
  }, [events, search, activeCategory]);

  const scenes = ['kyoto-evening', 'kyoto-garden', 'kyoto-torii'];
  const Icon = leaderboard ? Trophy : CalendarDays;

  return (
    <ClickSpark sparkColor="rgba(240, 168, 184, 0.75)" sparkSize={6} sparkRadius={26} sparkCount={7}>
      <PageHeading
        eyebrow={leaderboard ? 'THE ARENA OF CREATORS' : 'EXPLORE · PARTICIPATE · CREATE'}
        title={leaderboard ? 'Leaderboard' : 'Find your next beginning.'}
        description={
          leaderboard
            ? 'Every contribution counts. Explore the rankings and celebrate the people moving open source forward.'
            : 'Explore active tracks, follow participant leaderboards, and find real open-source events to build and learn.'
        }
      >
        <ShinyText speed={5} shineColor="#ffded2">
          <span lang="ja">{leaderboard ? '切磋琢磨' : '一期一会'}</span>
        </ShinyText>
      </PageHeading>

      {/* Main Filter & Search Toolbar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_4px_16px_var(--accent-soft)]'
                    : 'bg-[var(--card-soft)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--fg)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--card-soft)] text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all flex items-center gap-1.5"
              href={leaderboard ? '/user/winners' : '/user/repos'}
            >
              {leaderboard ? 'Meet the winners' : 'Explore repositories'} <ArrowUpRight size={14} />
            </Link>

            <label className="oc-search" style={{ minWidth: '220px' }}>
              <Search size={15} />
              <span className="sr-only">Search events</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by title or keyword…"
              />
            </label>
          </div>
        </div>

        {!loading && !error && (
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono">
            <p>
              Showing <span className="text-[var(--accent)] font-bold"><CountUp to={filtered.length} duration={0.8} /></span> of {events.length} curated events
            </p>
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="text-[var(--accent)] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading events" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <Skeleton
              key={n}
              height="380px"
              borderRadius="20px"
              startColor="rgba(42, 24, 50, 0.6)"
              endColor="rgba(65, 35, 75, 0.4)"
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
      ) : !filtered.length ? (
        <div className="glass-panel oc-empty">
          <Search size={28} />
          <h2>{search ? 'No matching events found' : 'New beginnings are on the way.'}</h2>
          <p>
            {search
              ? 'Try a different keyword or reset your category filter.'
              : 'Events will appear here when they are announced. In the meantime, explore our repositories.'}
          </p>
          {search ? (
            <button className="oc-button oc-button-secondary" onClick={() => { setSearch(''); setActiveCategory('all'); }}>
              Clear search
            </button>
          ) : (
            <Link className="oc-button oc-button-secondary" href="/user/repos">
              Explore repositories <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      ) : (
        /* Human-Crafted, Developer-First Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event, index) => {
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

            return (
              <AnimatedContent key={event.name} delay={index * 0.04}>
                <article
                  className="group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent" />

                    {/* Top Status & Track Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[var(--card-bg)] border border-[var(--border)] text-[var(--accent)] backdrop-blur-md">
                        {track}
                      </span>

                      {status.type === 'live' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Live Now
                        </span>
                      ) : status.type === 'upcoming' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 backdrop-blur-md flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-900/80 border border-zinc-700 text-zinc-400 backdrop-blur-md">
                          Concluded
                        </span>
                      )}
                    </div>

                    {/* Event Logo Avatar Badge */}
                    <div className="absolute -bottom-3 left-5 z-10 flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border-2 border-[var(--border-strong)] shadow-lg overflow-hidden flex items-center justify-center p-1">
                        {event.logoImageURL ? (
                          <img
                            src={event.logoImageURL}
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

                    {/* Developer Meta Stats Strip */}
                    <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-3">
                      <div className="grid grid-cols-3 gap-2 py-1 text-center bg-[var(--card-soft)] rounded-xl border border-[var(--border)]">
                        <div className="px-1 py-1">
                          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Format</p>
                          <p className="text-xs font-bold text-[var(--fg)] truncate">Online</p>
                        </div>
                        <div className="px-1 py-1 border-x border-[var(--border)]">
                          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Participants</p>
                          <p className="text-xs font-bold text-[#f5c542] font-mono truncate">150+ Devs</p>
                        </div>
                        <div className="px-1 py-1">
                          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Rankings</p>
                          <p className="text-xs font-bold text-[var(--accent)] truncate">Live</p>
                        </div>
                      </div>

                      {/* Tactile Action Link */}
                      <Link
                        href={`/user/leaderboard/${encodeURIComponent(event.name)}`}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 bg-[var(--accent-soft)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] transition-all duration-200 group-hover:border-[var(--accent)] shadow-sm"
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
      )}
    </ClickSpark>
  );
}
