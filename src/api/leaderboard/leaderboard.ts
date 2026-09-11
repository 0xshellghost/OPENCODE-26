const LEADERBOARD_API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/`;
type RowObj = {
	position:number;
	name: string;
	prmerged: string;
	githubid: string;
	points: string;
  avatarUrl: string,
  prDetailsURL: string,
  collegeName?: string,
  graduationYear?: string | number,
};

export const FetchedLeaderboard = async (eventName: string): Promise<RowObj[]> => {
  try {
    const response = await fetch(`${LEADERBOARD_API_URL}/${eventName}/leaderboard`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.statusText}`);
    }

    const Leaddata = await response.json();
  
    // console.log(Leaddata.data);
    // Assuming the API returns an array of leaderboard data
    return Leaddata.data as RowObj[];

  
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error; 
  }
};



