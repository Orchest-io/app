import { TaskType, TaskStatus, TaskPriority, DependencyType } from '../enums';

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  createdBy: string;
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  complexity?: number;
  estimatedHours?: number;
  actualHours?: number;
  sortOrder?: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted?: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  isPrimary?: boolean;
  assignedAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type?: DependencyType;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  isEdited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  taskId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSizeBytes?: number;
  createdAt: Date;
}
