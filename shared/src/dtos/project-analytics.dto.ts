export interface ProjectAnalyticsDto {
  summary: {
    totalStoryPoints: number;
    completedStoryPoints: number;
    completionPercentage: number;
    totalEstimatedHours: number;
    totalActualHours: number;
    remainingHoursEstimate: number;
  };
  statusBreakdown: {
    todoCount: number;
    inProgressCount: number;
    doneCount: number;
  };
  teamWorkload: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
    hoursLogged: number;
    pointsAssigned: number;
  }>;
  timeBleedTasks: Array<{
    id: string;
    title: string;
    estimatedHours: number;
    actualHours: number;
    overrunHours: number;
  }>;
}
