'use client';

import { useQuery } from '@tanstack/react-query';
import { FetchedEvents } from 'api/events/events';
import EventCollection from '../../../components/japanese/EventCollection';

export default function Leaderboards() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['EventInfo'], queryFn: FetchedEvents });
  return <EventCollection leaderboard events={data?.data || []} loading={isLoading} error={isError} retry={() => refetch()} />;
}
