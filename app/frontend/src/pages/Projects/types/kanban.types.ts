export type TaskPriority = 'low' | 'medium' | 'high';

export interface Assignee {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignees: Assignee[];
  subtasks: Subtask[];
  dueDate?: string; // Format: YYYY-MM-DD
  columnId: string;
  storyPoints?: number;
  milestoneId?: string | null;
  milestone?: {
    id: string;
    title: string;
    color: string | null;
    status: string;
  } | null;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export interface FilterState {
  searchQuery: string;
  priority: TaskPriority | 'all';
  assigneeId: string | null; // null = all members
}
