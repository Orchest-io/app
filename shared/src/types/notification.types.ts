import { NotificationType, ReferenceType, ActivityAction, EntityType } from '../enums';

export interface Notification {
  id: string;
  userId: string;
  type?: NotificationType;
  title: string;
  message?: string;
  referenceType?: ReferenceType;
  referenceId?: string;
  isRead?: boolean;
  isArchived?: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  userId: string;
  action?: ActivityAction;
  entityType?: EntityType;
  entityId?: string;
  description?: string;
  metadata?: any;
  createdAt: Date;
}
