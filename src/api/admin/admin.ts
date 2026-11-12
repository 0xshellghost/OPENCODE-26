// src/api/admin/admin.ts
import { getApiBase } from 'utils/apiBase';
import { EXPECTED_SNAPSHOT_BYTES } from 'config/canvas.config';

export async function getUserPRDetails(githubId: string, eventName: string) {
  const response = await fetch(
    `${getApiBase()}/api/v1/participant/${githubId}/${eventName}/pr`,
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

  const prEventDetails = await response.json();
  const formattedPr = prEventDetails.data;

  return formattedPr;
}

export async function EditPRPoints(prUpdateData: any) {
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    const response = await fetch(
      `${getApiBase()}/api/v1/admin/modify`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prUpdateData),
      },
    );

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error sending registration data:', error.message);
  }
}

export async function addRepo(
  eventName: string,
  repoName: string,
  options?: {
    tags?: string[];
    mentors?: string[];
    isFirstYrOnly?: boolean;
    isGirlsOnly?: boolean;
    description?: string;
  }
) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${getApiBase()}/api/v1/admin/event/${eventName}/repos/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      repoName,
      tags: options?.tags,
      mentors: options?.mentors,
      isFirstYrOnly: options?.isFirstYrOnly,
      isGirlsOnly: options?.isGirlsOnly,
      description: options?.description,
    }),
  });
  if (!response.ok) throw new Error('Failed to add repo');
  return await response.json();
}

export async function updateRepoTags(
  eventName: string,
  repoName: string,
  data: {
    tags?: string[];
    mentors?: string[];
    isFirstYrOnly?: boolean;
    isGirlsOnly?: boolean;
    description?: string;
  }
) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${getApiBase()}/api/v1/admin/event/${eventName}/repos/${repoName}/update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update repo');
  return await response.json();
}

export async function deleteRepo(eventName: string, repoName: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${getApiBase()}/api/v1/admin/event/${eventName}/repos/${repoName}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete repo');
  return await response.json();
}

export async function renameRepo(eventName: string, repoName: string, newRepoName: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${getApiBase()}/api/v1/admin/event/${eventName}/repos/${repoName}/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newRepoName }),
  });
  if (!response.ok) throw new Error('Failed to rename repo');
  return await response.json();
}

export interface MentorUser {
  id: string;
  githubId: string;
  name: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  isMentor?: boolean;
}

export async function fetchMentors(): Promise<MentorUser[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = token
    ? `${getApiBase()}/api/v1/admin/mentors`
    : `${getApiBase()}/api/v1/events/mentors`;

  try {
    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch {}

  const fallbackRes = await fetch(`${getApiBase()}/api/v1/events/mentors`);
  if (!fallbackRes.ok) throw new Error('Failed to fetch mentors');
  const fallbackData = await fallbackRes.json();
  return fallbackData.data || [];
}

export async function addMentor(userId: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const cleanId = userId.trim().replace(/^@/, '');
  const response = await fetch(`${getApiBase()}/api/v1/admin/${encodeURIComponent(cleanId)}/addMentor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || 'Failed to add mentor');
  }
  return await response.json();
}

export async function removeMentor(userId: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const cleanId = userId.trim().replace(/^@/, '');
  const response = await fetch(`${getApiBase()}/api/v1/admin/${encodeURIComponent(cleanId)}/removeMentor`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || 'Failed to remove mentor');
  }
  return await response.json();
}

export async function uploadEventLeaderboard(eventName: string, file: File) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please sign in as admin.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('eventName', eventName);

  const response = await fetch(
    `${getApiBase()}/api/v1/admin/event/${encodeURIComponent(eventName)}/leaderboard/upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.message || `Failed to upload leaderboard: ${response.statusText}`);
  }

  return await response.json();
}

export async function updateFlagshipEvent(eventName: string, isFlagship = true) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please sign in as admin.');

  const baseUrl = getApiBase();
  const url = `${baseUrl}/api/v1/admin/events/${encodeURIComponent(eventName)}/flagship`;

  console.log('[updateFlagshipEvent] Sending PUT request to:', url, { isFlagship });

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isFlagship }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || `Failed to update flagship event (HTTP ${response.status}: ${response.statusText})`);
  }

  return await response.json();
}

/**
 * Uploads a board snapshot to R/Place backend via /api/rplace/board proxy
 */
export async function uploadRPlaceBoardSnapshot(buffer: ArrayBuffer) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please sign in as admin.');

  if (buffer.byteLength !== EXPECTED_SNAPSHOT_BYTES) {
    throw new Error(`Snapshot buffer must be exactly ${EXPECTED_SNAPSHOT_BYTES.toLocaleString()} bytes (got ${buffer.byteLength.toLocaleString()})`);
  }

  const response = await fetch('/api/rplace/board', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      Authorization: `Bearer ${token}`,
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.message || `Failed to upload canvas snapshot (HTTP ${response.status})`);
  }

  return await response.json();
}

export interface BackendPlatformFeatures {
  showWinners: boolean;
  showMilestones: boolean;
  showLeaderboard: boolean;
  showRepositories: boolean;
  showRPlace: boolean;
  showGeekstore?: boolean;
}

export async function fetchPlatformFeatures(): Promise<BackendPlatformFeatures | null> {
  const baseUrl = getApiBase();
  const url = `${baseUrl}/api/v1/features`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return (data?.data || data) as BackendPlatformFeatures;
    }
  } catch (err) {
    console.warn('[fetchPlatformFeatures] Could not fetch from backend:', err);
  }

  return null;
}

export async function updatePlatformFeaturesInDb(
  featuresPayload: Partial<BackendPlatformFeatures>
): Promise<BackendPlatformFeatures> {
  if (typeof window === 'undefined') {
    throw new Error('Window is undefined');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please sign in as admin.');
  }

  const baseUrl = getApiBase();
  const url = `${baseUrl}/api/v1/admin/features`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(featuresPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `Failed to update features in database (HTTP ${response.status}: ${response.statusText})`
    );
  }

  const result = await response.json();
  return (result?.data || result) as BackendPlatformFeatures;
}
