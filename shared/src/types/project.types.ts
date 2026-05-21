import { ProjectStatus, ProjectPriority, ProjectType, ProjectMode, ProjectMemberRole } from '../enums';

export interface Project {
  id: string;
  createdBy: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  projectType?: ProjectType;
  projectMode?: ProjectMode;
  progress?: number;
  budget?: string;
  startDate?: Date;
  endDate?: Date;
  objectives?: string;
  requirements?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role?: ProjectMemberRole;
  joinedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  progress?: number;
  targetDate?: Date;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}
