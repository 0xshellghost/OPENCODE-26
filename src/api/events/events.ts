import { USE_SEED_DATA, seedEvents, seedRepos, getSeedProfile } from 'constants/seedData';

export async function FetchedEvents() {
  if (USE_SEED_DATA) {
    return Promise.resolve({ success: true, data: seedEvents });
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const feventsData = await response.json();
  return feventsData;
}

export async function getUserIssueDetails(
  githubId: string,
  eventName: string,
  repoName: string,
) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (USE_SEED_DATA) {
    const profile = getSeedProfile(githubId);
    const match = profile.PR?.find((p: any) => p.issue?.repoName === repoName);
    return match ? match.issue : null;
  }

  const token = localStorage.getItem('token');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/participant/${githubId}/${eventName}/issues`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const issueDetails = await response.json();
  // console.log(issueDetails);

  const issuesAll: any[] = issueDetails.data;

  const filteredIssuesAll = issuesAll.filter(
    (obj: any) => obj.repoName === repoName,
  );

  if (filteredIssuesAll.length === 0) {
    return null;
  }
  return filteredIssuesAll[0];
}

export async function FetchedRepos(eventName: string) {
  if (USE_SEED_DATA) {
    return Promise.resolve({ success: true, data: seedRepos });
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/${eventName}/repos`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch repos');
  }

  const reposData = await response.json();
  return reposData;
}

