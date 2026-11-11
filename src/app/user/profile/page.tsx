'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flex } from '@chakra-ui/react';
import { RingLoader } from 'react-spinners';
import { parseJwt } from 'utils/jwt';

export interface PullRequest {
  prNumber: number;
  status: string;
  title: string;
  issue: {
    issueNumber: number;
    currentPoints: number;
    repoName: string;
  };
}

export interface ProfileData {
  name: string;
  email?: string;
  college?: string;
  avatarUrl?: string;
  githubId: string;
  discordId?: string;
  gender?: string;
  year?: string;
  graduationYear?: number | string;
  isMentor?: boolean;
  isAdmin?: boolean;
  PR: PullRequest[]; 
  prMerged: number;
  points: number;
  totalPRs?: number;
  rank?: number | null;
}

export default function ProfileSelf() {
  const router = useRouter();

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('user') ?? '{}');
      let githubID = cached?.githubId;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!githubID && token) {
        const payload = parseJwt(token);
        if (payload?.githubId) {
          githubID = payload.githubId;
        }
      }

      if (githubID) {
        router.replace(`/user/profile/${encodeURIComponent(githubID)}`);
      } else if (token) {
        router.replace('/auth/register');
      } else {
        router.replace('/auth/sign-in');
      }
    } catch {
      router.replace('/auth/sign-in');
    }
  }, [router]);

  return (
    <Flex minH="60vh" align="center" justify="center">
      <RingLoader color="var(--accent)" size={48} />
    </Flex>
  );
}

