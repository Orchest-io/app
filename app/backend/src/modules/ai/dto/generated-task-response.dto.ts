export class SuggestedAssigneeDto {
  userId: string;
  fullName: string;
  avatarUrl: string;
}

export class GeneratedTaskResponseDto {
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  storyPoints: number;
  dueDate: string | null;
  subtasks: string[];
  suggestedAssignees: SuggestedAssigneeDto[];
}
