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
};

export type RowObj = LeaderboardEntry;

export const FetchedLeaderboard = async (eventName: string): Promise<LeaderboardEntry[]> => {

  try {
    const response = await fetch(`${LEADERBOARD_API_URL}${eventName}/leaderboard`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.statusText}`);
    }

    const Leaddata = await response.json();
  
    return Leaddata.data as RowObj[];
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error; 
  }
};

