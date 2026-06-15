// Feature: notification-system
// Domain events emitted via EventEmitter2 for notification triggers.
// All event constants and classes used across TasksService, ProjectsService,
// DueDateSchedulerService, and NotificationEventsListener.

// ─── Event Constants ─────────────────────────────────────────────────────────

export const TASK_ASSIGNED_EVENT = 'notification.task.assigned';
export const TASK_COMPLETED_EVENT = 'notification.task.completed';
export const MILESTONE_CREATED_EVENT = 'notification.milestone.created';
export const MEMBER_ADDED_EVENT = 'notification.member.added';
export const DUE_DATE_REMINDER_EVENT = 'notification.task.due-reminder';

// ─── Event Classes ────────────────────────────────────────────────────────────

/**
 * Emitted when a user is added as a Task_Assignee to a task.
 * Validates: Requirement 1.1
 */
export class TaskAssignedEvent {
  taskId: string;
  taskTitle: string;
  /** Recipient — the newly assigned user */
  assigneeUserId: string;
  actorUserId: string;
  actorDisplayName: string;
}

/**
 * Emitted when a task's status changes to 'done'.
 * Validates: Requirement 2.1
 */
export class TaskCompletedEvent {
  taskId: string;
  taskTitle: string;
  /** Recipient — the project owner (project.createdBy) */
  projectOwnerId: string;
  actorUserId: string;
  actorDisplayName: string;
}

/**
 * Emitted when a new milestone is created in a project.
 * Validates: Requirement 3.1
 */
export class MilestoneCreatedEvent {
  milestoneId: string;
  milestoneTitle: string;
  projectId: string;
  projectName: string;
  /** Recipients — all non-owner project members */
  recipientUserIds: string[];
}

/**
 * Emitted when a user is added as a ProjectMember to a project.
 * Validates: Requirement 5.1
 */
export class MemberAddedEvent {
  projectId: string;
  projectName: string;
  /** Recipient — the newly added member */
  newMemberUserId: string;
  actorUserId: string;
  actorDisplayName: string;
}

/**
 * Emitted by DueDateSchedulerService when a task is within the 24-hour reminder window.
 * Validates: Requirement 4.1
 */
export class DueDateReminderEvent {
  taskId: string;
  taskTitle: string;
  dueDate: Date;
  /** Recipients — all current task assignees */
  assigneeUserIds: string[];
}
