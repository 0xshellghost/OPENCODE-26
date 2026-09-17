'use client';

import { useQuery } from '@tanstack/react-query';
import { FetchedEvents } from 'api/events/events';
import { fetchLoggedInBasicDetails } from 'api/profile/profile';
import axios from 'axios';
import { useAuth } from 'contexts/AuthContext';
import { useEffect } from 'react';
import EventCollection from 'components/japanese/EventCollection';

export default function Dashboard() {
  const auth = useAuth();
  const { data: eventData, isLoading, isError, refetch } = useQuery({ queryKey: ['EventInfo'], queryFn: FetchedEvents });

  useEffect(() => {
    const urlParam = new URLSearchParams(window.location.search);
    const tokenParam = urlParam.get('token');
    if (tokenParam === null) auth.check_login();
    else localStorage.setItem('token', tokenParam);
    if (localStorage.getItem('token')) {
      fetchLoggedInBasicDetails();
      axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/register?eventName=${encodeURIComponent(`${process.env.NEXT_PUBLIC_EVENT_NAME}`)}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
      );
    }
  }, [auth]);

  return <EventCollection events={eventData?.data || []} loading={isLoading} error={isError} retry={() => refetch()} />;
}
