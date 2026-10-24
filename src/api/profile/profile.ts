import { FetchedLeaderboard } from 'api/leaderboard/leaderboard';
import {
  USE_SEED_DATA,
  seedDefaultUser,
  getSeedProfile,
  seedColleges,
} from 'constants/seedData';

export async function fetchLoggedInBasicDetails() {
  if (typeof window === 'undefined') return null;

  if (USE_SEED_DATA) {
    const existing = localStorage.getItem('user');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed?.githubId) return parsed;
      } catch {
        // ignore
      }
    }
    localStorage.setItem('token', 'seed-mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(seedDefaultUser));
    return seedDefaultUser;
  }

  const token = localStorage.getItem('token');

  if (token === null) {
    console.warn('No token found, redirecting to login.');
    return null;
  } else {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/participant/`,
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
    const data = (await response.json()).data;
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }
}

export async function sendRegData(formData: any) {
  if (USE_SEED_DATA) {
    return Promise.resolve({
      success: true,
      message: 'Registration successful (Seeded Mock)',
      data: formData,
    });
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      },
    );

    if (response.status === 200) {
      // console.log('Success!');
    } else {
      console.error('Registration failed:', response.statusText);
    }

    const data = await response.json();
    // console.log(data);
    return data;
  } catch (error: any) {
    console.error('Error sending registration data:', error.message);
  }
}

export async function getUserProfileByName(profileName: string) {
  if (USE_SEED_DATA) {
    const profile = getSeedProfile(profileName);
    return Promise.resolve({ success: true, data: profile });
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/participant/${profileName}/${process.env.NEXT_PUBLIC_EVENT_NAME}`,
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

  return response.json();
}

export type ProfileUpdatePayload = {
  name: string;
  college: string;
  discordId: string;
  gender?: string;
  year?: string;
};

export async function updateUserProfile(updatedData: ProfileUpdatePayload) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    throw new Error('No authentication token found. Please sign in again.');
  }

  // Never send GitHub ID or email — those fields are immutable.
  const payload: ProfileUpdatePayload = {
    name: updatedData.name,
    college: updatedData.college,
    discordId: updatedData.discordId,
    gender: updatedData.gender,
    year: updatedData.year,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/participant/update`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    let message = 'Failed to update profile';
    try {
      const err = await response.json();
      message = err.message || err.error || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const data = await response.json();

  if (typeof window !== 'undefined') {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
      const serverData =
        data && typeof data === 'object' && data.data && typeof data.data === 'object'
          ? data.data
          : {};
      const merged = {
        ...currentUser,
        ...serverData,
        ...payload,
        githubId: currentUser.githubId ?? serverData.githubId,
        email: currentUser.email ?? serverData.email,
      };
      localStorage.setItem('user', JSON.stringify(merged));
    } catch (e) {
      console.error('Error updating localStorage:', e);
    }
  }

  return data;
}

export async function fetchColleges(param?: string | { queryKey?: unknown }): Promise<string[]> {
  const targetEvent =
    typeof param === 'string' && param
      ? param
      : process.env.NEXT_PUBLIC_EVENT_NAME || "OPENCODE'26";

  // 1. Fetch registered colleges from the active event leaderboard
  try {
    const leadData = await FetchedLeaderboard(targetEvent);
    if (leadData && Array.isArray(leadData)) {
      const colleges = leadData
        .map((item) => (item.collegeName ?? '')?.trim())
        .filter(Boolean);
      const uniqueColleges = [...new Set(colleges)].sort();
      if (uniqueColleges.length > 0) {
        return uniqueColleges;
      }
    }
  } catch (error) {
    console.error('Error fetching colleges from event leaderboard:', error);
  }

  // 2. Fallback to /api/v1/colleges if available
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/colleges`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        return [...new Set((data.data as string[]).map((c) => c?.trim()).filter(Boolean))].sort();
      }
    }
  } catch {
    // ignore backend colleges endpoint error
  }

  // 3. Fallback list of known colleges when offline or event is newly initialized
  return [
    'Birla Institute of Technology and Science, Pilani',
    'Delhi Technological University',
    'Indian Institute of Information Technology, Allahabad',
    'Indian Institute of Information Technology, Hyderabad',
    'Indian Institute of Information Technology, Lucknow',
    'Indian Institute of Technology BHU',
    'Indian Institute of Technology Bombay',
    'Indian Institute of Technology Delhi',
    'Indian Institute of Technology Kanpur',
    'Indian Institute of Technology Kharagpur',
    'Indian Institute of Technology Madras',
    'Indian Institute of Technology Roorkee',
    'Motilal Nehru National Institute of Technology, Allahabad',
    'National Institute of Technology, Rourkela',
    'National Institute of Technology, Surathkal',
    'National Institute of Technology, Tiruchirappalli',
    'National Institute of Technology, Warangal',
    'Netaji Subhas University of Technology',
    'Vellore Institute of Technology',
  ];
}

