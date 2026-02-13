import {UserLeaderboardData, week01Leaderboards, week02Leaderboards, week03Leaderboards,week04Leaderboards, week05Leaderboards} from '../../constants/week_wise_Leaderboard_data';
import { EventWinners } from 'constants/event_winners_data';
function compileWeekData(data: UserLeaderboardData[]) {
    const compiled = data.map((user) => ({
          rank: Number(user.position),            // "1" → 1
          name: user.name,
          username: user.githubid,
          avatar: user.avatarUrl,                 // using GitHub avatar directly
          score: user.points,
          prMerged: user.prmerged,
        }))
    return compiled
  }


export const weeklyLeaderboards = [
  {
    week: 1,
    startDate: '2025-12-26',
    endDate: '2026-01-02',
    leaderboard : [...compileWeekData(week01Leaderboards)]
  },

  {
    week: 2,
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    leaderboard: [...compileWeekData(week02Leaderboards)]
  },

  {
    week: 3,
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    leaderboard: [...compileWeekData(week03Leaderboards)]
  },

  {
    week: 4,
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    leaderboard: [...compileWeekData(week04Leaderboards)]
  },

  {
    week: 5,
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    leaderboard: [...compileWeekData(week05Leaderboards)]
  },
];

// =====================
// DEMO API FUNCTIONS
// =====================

// Fetch weekly leaderboards
export const fetchWeeklyLeaderboards = async () => {
  return Promise.resolve({
    success: true,
    message: 'Weekly leaderboards fetched successfully',
    data: weeklyLeaderboards,
  });
};

// Fetch event winners
export const fetchEventWinners = async () => {
  return Promise.resolve({
    success: true,
    message: 'Event winners fetched successfully',
    data: EventWinners,
  });
};

// Fetch specific week leaderboard
export const fetchWeekLeaderboard = async (week: number) => {
  const weekData = weeklyLeaderboards.find((item) => item.week === week);

  if (!weekData) {
    return Promise.resolve({
      success: false,
      message: `Week ${week} not found`,
      data: null,
    });
  }

  return Promise.resolve({
    success: true,
    message: `Week ${week} leaderboard fetched successfully`,
    data: weekData,
  });
};

// Fetch specific event winners by repo name
export const fetchEventWinnersByName = async (repoName: string) => {
  const repoData = EventWinners[repoName as keyof typeof EventWinners];

  if (!repoData) {
    return Promise.resolve({
      success: false,
      message: `No winners found for ${repoName}`,
      data: {},
    });
  }

  return Promise.resolve({
    success: true,
    message: `Winners for ${repoName} fetched successfully`,
    data: repoData,
  });
};
