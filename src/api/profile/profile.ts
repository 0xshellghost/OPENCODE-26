import { FetchedLeaderboard } from 'api/leaderboard/leaderboard';
import { getApiBase } from 'utils/apiBase';

export async function fetchLoggedInBasicDetails() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');

  if (token === null) {
    console.warn('No token found, redirecting to login.');
    return null;
  } else {
    const eventName = process.env.NEXT_PUBLIC_EVENT_NAME || 'Opencode';
    const response = await fetch(
      `${getApiBase()}/api/v1/participant/?eventName=${encodeURIComponent(eventName)}`,
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
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
    }
  }

  if (token) {
    token = token.trim();
  }

  // Ensure avatarUrl is never missing (Prisma User model requires avatarUrl: String)
  const avatarUrl =
    formData.avatarUrl?.trim() ||
    (formData.githubId ? `https://github.com/${formData.githubId}.png` : 'https://github.com/identicons/user.png');

  const payload = {
    ...formData,
    avatarUrl,
    graduationYear: Number(formData.graduationYear),
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBase()}/api/v1/register`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch (netErr: any) {
    console.error('Registration network error:', netErr);
    throw new Error(`Network error while contacting server (${netErr?.message || 'CORS or offline'}). Please check your connection.`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Registration failed (${response.status}: ${response.statusText})`;
    console.error('Registration failed:', errorMsg);
    const error = new Error(errorMsg) as Error & { fields?: Record<string, string>; status?: number };
    error.fields = data?.fields;
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getUserProfileByName(profileName: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const eventName = process.env.NEXT_PUBLIC_EVENT_NAME || 'Opencode';

  const response = await fetch(
    `${getApiBase()}/api/v1/participant/${encodeURIComponent(profileName)}/${encodeURIComponent(eventName)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // Never send GitHub ID or email - those fields are immutable.
  const payload: ProfileUpdatePayload = {
    name: updatedData.name,
    college: updatedData.college,
    discordId: updatedData.discordId,
    gender: updatedData.gender,
    year: updatedData.year,
  };

  const response = await fetch(
    `${getApiBase()}/api/v1/participant/update`,
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

  const isIIITAllahabad = (col: string) => {
    const s = col.toLowerCase().replace(/[^a-z]/g, '');
    return s.includes('allahabad') && (s.includes('iiit') || s.includes('informationtechnology'));
  };

  // 1. Fetch registered colleges from the active event leaderboard
  try {
    const leadData = await FetchedLeaderboard(targetEvent);
    if (leadData && Array.isArray(leadData)) {
      const colleges = leadData
        .map((item) => (item.collegeName ?? '')?.trim())
        .filter((c) => Boolean(c) && !isIIITAllahabad(c));
      const uniqueColleges = [...new Set(colleges)].sort();
      if (uniqueColleges.length > 0) {
        return uniqueColleges;
      }
    }
  } catch (error) {
    console.error('Error fetching colleges from event leaderboard:', error);
  }

  // 2. Fallback list of known colleges when offline or event is newly initialized
  return [
    'Birla Institute of Technology and Science, Pilani',
    'Delhi Technological University',
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

