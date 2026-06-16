export interface ContextualAnalyticsDto {
  userRole: 'PM' | 'Member';
  projectSummary: {
    totalPoints: number;
    completedPoints: number;
    completionPercentage: number;
    totalEstimatedHours: number;
    totalActualHours: number;
  };
  personalSummary: {
    myTotalPoints: number;
    myCompletedPoints: number;
    myCompletionPercentage: number;
    myEstimatedHours: number;
    myActualHours: number;
  };
  // Macro team data (Only populated if userRole === 'PM', otherwise undefined)
  teamWorkload?: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
    hoursLogged: number;
    pointsAssigned: number;
  }>;
  // Macro project risk (Only populated if userRole === 'PM', otherwise undefined)
  projectTimeBleed?: Array<{
    id: string;
    title: string;
    estimatedHours: number;
    actualHours: number;
    overrunHours: number;
  }>;
  // Personal risk (Populated for all roles)
  myPersonalTimeBleed: Array<{
    id: string;
    title: string;
    estimatedHours: number;
    actualHours: number;
    overrunHours: number;
  }>;
}
