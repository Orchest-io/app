export enum TaskType {
  FEATURE = 'feature',
  BUG = 'bug',
  TASK = 'task',
  IMPROVEMENT = 'improvement',
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DependencyType {
  BLOCKS = 'blocks',
  REQUIRES = 'requires',
  RELATED = 'related',
}
