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

export default function ProfileSelf() {
  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem('user') ?? '{}');
    const githubID = cached?.githubId;
    if (githubID) redirect(`/user/profile/${githubID}`);
    else redirect('/auth/sign-in');
  }, []);
}

