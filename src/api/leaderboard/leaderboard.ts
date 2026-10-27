import { registerMentors } from 'constants/Maintainers';

const LEADERBOARD_API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/`;
export type LeaderboardEntry = {
	position: number | string;
	name: string;
	githubid?: string;
	prmerged?: string | number;
	points?: string | number;
  avatarUrl?: string;
  prDetailsURL?: string;
  collegeName?: string;
  graduationYear?: string | number;
  isMentor?: boolean;
};

export type RowObj = LeaderboardEntry;

export const FetchedLeaderboard = async (eventName: string): Promise<LeaderboardEntry[]> => {

  try {
    const response = await fetch(`${LEADERBOARD_API_URL}${eventName}/leaderboard`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.statusText}`);
    }

    const Leaddata = await response.json();
    const rows = (Leaddata.data || []) as RowObj[];
    if (Array.isArray(rows)) {
      const mentorsFromLead = rows
        .filter((r) => r.isMentor && r.githubid)
        .map((r) => r.githubid as string);
      if (mentorsFromLead.length > 0) {
        registerMentors(mentorsFromLead);
      }
    }
  
    return rows;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error; 
  }
};

