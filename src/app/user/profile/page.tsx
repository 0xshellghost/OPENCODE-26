'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

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
  email: string;
  college: string;
  avatarUrl: string;
  githubId: string;
  discordId: string;
  gender?: string;
  year?: string;
  PR: PullRequest[]; 
  prMerged: number;
  points: number;
  rank: number;
}

import { USE_SEED_DATA, seedDefaultUser } from 'constants/seedData';

export default function ProfileSelf() {
  useEffect(() => {
    let cached = JSON.parse(localStorage.getItem('user') ?? '{}');
    if (!cached?.githubId && USE_SEED_DATA) {
      localStorage.setItem('token', 'seed-mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(seedDefaultUser));
      cached = seedDefaultUser;
    }
    const githubID = cached?.githubId;
    if (githubID) redirect(`/user/profile/${githubID}`);
    else redirect('/auth/sign-in');
  }, []);
}

