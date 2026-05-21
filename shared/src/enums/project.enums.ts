export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_TRACK = 'on-track',
  AT_RISK = 'at-risk',
  DELAYED = 'delayed',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ProjectType {
  AI = 'ai',
  MANUAL = 'manual',
}

export enum ProjectMode {
  TEAM = 'team',
  INDIVIDUAL = 'individual',
}

export enum ProjectMemberRole {
  OWNER = 'owner',
  MEMBER = 'member',
}
