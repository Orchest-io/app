export interface ContextualAnalyticsDto {
  userRole: 'PM' | 'Member';
  
  projectSummary: {
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    completionPercentage: number;
  };
  
  personalSummary: {
    myTotalPoints: number;
    myCompletedPoints: number;
    myRemainingPoints: number;
    myCompletionPercentage: number;
  };
  
  // Only populated when userRole === 'PM'
  teamWorkload?: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
    pointsAssigned: number;
    pointsCompleted: number;
    pointsRemaining: number;
  }>;
}
