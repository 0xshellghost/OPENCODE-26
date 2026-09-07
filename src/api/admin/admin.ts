// src/api/events/pr.ts (or your specific filename)

export async function getUserPRDetails(githubId: string, eventName: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/participant/${githubId}/${eventName}/pr`,
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
  // Safety check for browser environment
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/modify`,
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
    console.log(data);
    return data;
  } catch (error: any) {
    console.error('Error sending registration data:', error.message);
  }
}

export async function addRepo(eventName: string, repoName: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/event/${eventName}/repos/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ repoName }),
  });
  if (!response.ok) throw new Error('Failed to add repo');
  return await response.json();
}

export async function deleteRepo(eventName: string, repoName: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/event/${eventName}/repos/${repoName}/delete`, {
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/event/${eventName}/repos/${repoName}/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newRepoName }),
  });
  if (!response.ok) throw new Error('Failed to rename repo');
  return await response.json();
}

export async function addMentor(userId: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/${userId}/addAdmin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to add mentor/admin');
  return await response.json();
}
