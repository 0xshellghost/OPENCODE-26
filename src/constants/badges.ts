import { Trophy, Star, Medal, Award, Crown, Zap, Flame, Rocket, FolderGit2 } from 'lucide-react';
import { ElementType } from 'react';

// Import or define the PR interface locally to avoid circular dependencies if needed
export interface PullRequest {
  status: string;
  issue: {
    repoName: string;
  };
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  threshold: number;
  color: string;
  icon: ElementType;
}

export const GLOBAL_PR_BADGES: BadgeDefinition[] = [
  { id: 'first_pr', title: 'PR Pioneer', description: '1 merged pull request', threshold: 1, color: 'purple', icon: Star },
  { id: '10_prs', title: 'Rising Contributor', description: '10 merged pull requests', threshold: 10, color: 'pink', icon: Zap },
  { id: '30_prs', title: 'PR Veteran', description: '30 merged pull requests', threshold: 30, color: 'red', icon: Flame },
  { id: '50_prs', title: 'Open Source Champion', description: '50 merged pull requests', threshold: 50, color: 'green', icon: Award },
  { id: '100_prs', title: 'Centurion', description: '100 merged pull requests', threshold: 100, color: 'yellow', icon: Crown },
  { id: '150_prs', title: 'Legend', description: '150 merged pull requests', threshold: 150, color: 'orange', icon: Trophy },
  { id: '200_prs', title: 'Grandmaster', description: '200 merged pull requests', threshold: 200, color: 'purple', icon: Rocket },
];

export const REPO_PR_BADGES = [
  { threshold: 10, titleSuffix: 'Contributor', color: 'pink', icon: FolderGit2 },
  { threshold: 30, titleSuffix: 'Veteran', color: 'red', icon: FolderGit2 },
  { threshold: 50, titleSuffix: 'Expert', color: 'green', icon: FolderGit2 },
  { threshold: 100, titleSuffix: 'Legend', color: 'yellow', icon: FolderGit2 },
];

export function getEligibleBadges(prMerged: number, prs: PullRequest[] = []): BadgeDefinition[] {
  const earned: BadgeDefinition[] = [];

  // Global Badges
  for (const b of GLOBAL_PR_BADGES) {
    if (prMerged >= b.threshold) {
      earned.push(b);
    }
  }

  // Repo Specific Badges
  if (prs && prs.length > 0) {
    const repoCounts: Record<string, number> = {};
    for (const pr of prs) {
      if (pr.status?.toLowerCase() === 'merged' && pr.issue?.repoName) {
        repoCounts[pr.issue.repoName] = (repoCounts[pr.issue.repoName] || 0) + 1;
      }
    }

    for (const [repoName, count] of Object.entries(repoCounts)) {
      for (const b of REPO_PR_BADGES) {
        if (count >= b.threshold) {
          earned.push({
            id: `repo_${repoName}_${b.threshold}`,
            title: `${repoName} ${b.titleSuffix}`,
            description: `${b.threshold} merged PRs in ${repoName}`,
            threshold: b.threshold,
            color: b.color,
            icon: b.icon,
          });
        }
      }
    }
  }

  return earned.sort((a, b) => b.threshold - a.threshold);
}
