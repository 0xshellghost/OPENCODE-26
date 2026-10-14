'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Search, Trophy, RefreshCw } from 'lucide-react';
import { Skeleton } from '@chakra-ui/react';
import PageHeading from './PageHeading';

type Event = {
  name: string;
  description?: string;
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

    if (trimmed.startsWith('/images/')) {
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
    />
  );
}

export default function EventCollection({ events, loading, error, retry, leaderboard = false }: { events: Event[]; loading: boolean; error: boolean; retry: () => void; leaderboard?: boolean }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => events.filter(event => `${event.name} ${event.description || ''}`.toLowerCase().includes(search.toLowerCase())), [events, search]);
  const scenes = ['kyoto-evening', 'kyoto-garden', 'kyoto-torii'];
  const Icon = leaderboard ? Trophy : CalendarDays;
  return (
    <>
      <PageHeading eyebrow={leaderboard ? 'THE ARENA OF CREATORS' : 'EXPLORE · PARTICIPATE · CREATE'} title={leaderboard ? 'Leaderboard' : 'Find your next beginning.'} description={leaderboard ? 'Every contribution counts. Explore the rankings and celebrate the people moving open source forward.' : 'Small contributions. Shared ambitions. Discover an event, find your community, and create something that matters.'}>
        <span lang="ja">{leaderboard ? '切磋琢磨' : '一期一会'}</span>
      </PageHeading>
      <div className="oc-toolbar">
        <div className="oc-tabs"><span className="oc-chip">{leaderboard ? 'Event leaderboards' : 'All events'}</span><Link className="oc-chip" href={leaderboard ? '/user/winners' : '/user/repos'}>{leaderboard ? 'Meet the winners' : 'Explore repositories'} <span aria-hidden="true">↗</span></Link></div>
        <label className="oc-search"><Search size={16} /><span className="sr-only">Search events</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" /></label>
      </div>
      {!loading && !error && <p className="oc-results-count">{filtered.length} {filtered.length === 1 ? 'event' : 'events'} to explore</p>}
      {loading ? <div className="oc-event-grid" aria-label="Loading events" aria-busy="true">{[0, 1, 2].map(n => <Skeleton key={n} height="340px" borderRadius="18px" startColor="var(--card-soft)" endColor="var(--card-bg)" />)}</div> : error ? (
        <div className="glass-panel oc-empty" role="status"><CalendarDays size={30} /><h2>A brief pause in the journey.</h2><p>We couldn&apos;t load the events right now. Please try again in a moment.</p><button className="oc-button oc-button-secondary" onClick={retry}><RefreshCw size={15} />Try again</button></div>
      ) : !filtered.length ? (
        <div className="glass-panel oc-empty"><Search size={28} /><h2>{search ? 'No matching events' : 'New beginnings are on the way.'}</h2><p>{search ? 'Try a different event name or clear your search.' : 'Events will appear here when they are announced. In the meantime, learn how to make your first contribution.'}</p>{search ? <button className="oc-button oc-button-secondary" onClick={() => setSearch('')}>Clear search</button> : <Link className="oc-button oc-button-secondary" href="/faq">Explore the guide <ArrowUpRight size={15} /></Link>}</div>
      ) : <div className="oc-event-grid">{filtered.map((event, index) => {
        const decodedName = (() => {
          try {
            return decodeURIComponent(event.name || '');
          } catch {
            return event.name;
          }
        })();
        return (
          <article key={event.name} className="glass-panel oc-event-card">
            <div className="oc-event-image">
              <EventCardImage event={event} fallbackScene={scenes[index % scenes.length]} />
              <span className="oc-event-number">{String(index + 1).padStart(2, '0')} / OPENCODE</span>
            </div>
            <div className="oc-event-body">
              <span className="oc-event-icon"><Icon size={19} /></span>
              <h2>{decodedName}</h2>
              <p>{event.description || (leaderboard ? 'Meet the contributors setting the pace. Find your place among this event’s open-source community.' : 'Learn by building, collaborate with fellow contributors, and leave your mark on open source.')}</p>
              <Link className="oc-event-link" href={`/user/leaderboard/${encodeURIComponent(event.name)}`}>
                {leaderboard ? 'View rankings' : 'Explore event'}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </article>
        );
      })}</div>}
    </>
  );
}
