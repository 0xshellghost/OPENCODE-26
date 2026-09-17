'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Search, Trophy, RefreshCw } from 'lucide-react';
import { Skeleton } from '@chakra-ui/react';
import PageHeading from './PageHeading';

type Event = { name: string; description?: string };

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
      ) : <div className="oc-event-grid">{filtered.map((event, index) => <article key={event.name} className="glass-panel oc-event-card">
        <div className="oc-event-image"><Image src={`/images/${scenes[index % scenes.length]}.png`} alt="" fill sizes="(max-width: 480px) 100vw, (max-width: 1100px) 50vw, 33vw" /><span className="oc-event-number">{String(index + 1).padStart(2, '0')} / OPENCODE</span></div>
        <div className="oc-event-body"><span className="oc-event-icon"><Icon size={19} /></span><h2>{event.name}</h2><p>{event.description || (leaderboard ? 'Meet the contributors setting the pace. Find your place among this event’s open-source community.' : 'Learn by building, collaborate with fellow contributors, and leave your mark on open source.')}</p><Link className="oc-event-link" href={`/user/leaderboard/${encodeURIComponent(event.name)}`}>{leaderboard ? 'View rankings' : 'Explore event'}<ArrowUpRight size={17} /></Link></div>
      </article>)}</div>}
    </>
  );
}
