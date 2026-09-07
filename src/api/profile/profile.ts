export async function fetchLoggedInBasicDetails() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');

  if (token === null) {
    console.log('No token found, redirecting to login.');
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
  try {
    const token = localStorage.getItem('token');
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
      console.log('Success!');
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
  const token = localStorage.getItem('token');

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
    throw new Error('Not authenticated');
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
