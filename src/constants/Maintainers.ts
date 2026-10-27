const dynamicMentors = new Set<string>();

export const registerMentors = (mentors: string[]) => {
  mentors.forEach((m) => {
    if (m && typeof m === 'string') {
      dynamicMentors.add(m.trim().toLowerCase().replace(/^@/, ''));
    }
  });
};

export const isMaintainer = (githubId?: string | null): boolean => {
  if (!githubId) return false;
  const clean = githubId.trim().toLowerCase().replace(/^@/, '');
  return dynamicMentors.has(clean);
};

// Populate mentors from API on load
if (typeof window !== 'undefined') {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  fetch(`${backendUrl}/api/v1/events/mentors`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.data && Array.isArray(data.data)) {
        registerMentors(data.data.map((m: any) => m.githubId));
      }
    })
    .catch(() => {});
}
