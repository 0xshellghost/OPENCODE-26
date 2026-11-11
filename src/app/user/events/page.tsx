'use client';

import { useQuery } from '@tanstack/react-query';
import { FetchedEvents } from 'api/events/events';
import { fetchLoggedInBasicDetails } from 'api/profile/profile';
import axios from 'axios';
import { useAuth } from 'contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventCollection from 'components/japanese/EventCollection';
import { getApiBase } from 'utils/apiBase';

export default function Dashboard() {
  const auth = useAuth();
  const router = useRouter();
  const { data: eventData, isLoading, isError, refetch } = useQuery({ queryKey: ['EventInfo'], queryFn: FetchedEvents });

  useEffect(() => {
    const urlParam = new URLSearchParams(window.location.search);
    const tokenParam = urlParam.get('token');
    const avatarParam = urlParam.get('avatar_url');

    if (tokenParam === null) {
      auth.check_login();
    } else {
      localStorage.setItem('token', tokenParam);
    }

    const token = localStorage.getItem('token');
    if (token) {
      fetchLoggedInBasicDetails()
        .then((userData) => {
          if (!userData) {
            // Unregistered user -> redirect to registration form
            const avatarQuery = avatarParam ? `&avatar_url=${encodeURIComponent(avatarParam)}` : '';
            router.replace(`/auth/register?token=${encodeURIComponent(token)}${avatarQuery}`);
            return;
          }
          // Registered participant -> enroll in current active event
          axios.post(
            `${getApiBase()}/api/v1/events/register?eventName=${encodeURIComponent(`${process.env.NEXT_PUBLIC_EVENT_NAME}`)}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          ).catch((e) => console.warn('Event registration check:', e?.message));
        })
        .catch((err) => {
          console.warn('Participant details not found, redirecting to register:', err?.message);
          const avatarQuery = avatarParam ? `&avatar_url=${encodeURIComponent(avatarParam)}` : '';
          router.replace(`/auth/register?token=${encodeURIComponent(token)}${avatarQuery}`);
        });
    }
  }, [auth, router]);

  return <EventCollection events={eventData?.data || []} loading={isLoading} error={isError} retry={() => refetch()} />;
}

