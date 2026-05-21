export enum NotificationType {
  TASK = 'task',
  COMMENT = 'comment',
  MENTION = 'mention',
  UPDATE = 'update',
  ALERT = 'alert',
}

export enum ReferenceType {
  TASK = 'task',
  PROJECT = 'project',
  COMMENT = 'comment',
  MILESTONE = 'milestone',
}

export enum ActivityAction {
  CREATED = 'created',
  UPDATED = 'updated',
  COMPLETED = 'completed',
  COMMENTED = 'commented',
  ASSIGNED = 'assigned',
  DELETED = 'deleted',
}

export enum EntityType {
  TASK = 'task',
  PROJECT = 'project',
  MILESTONE = 'milestone',
  COMMENT = 'comment',
}
