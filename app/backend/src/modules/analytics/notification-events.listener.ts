// Feature: notification-system
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationService } from "./notification.service";
import {
	TASK_ASSIGNED_EVENT,
	TaskAssignedEvent,
	TASK_COMPLETED_EVENT,
	TaskCompletedEvent,
	MILESTONE_CREATED_EVENT,
	MilestoneCreatedEvent,
	MEMBER_ADDED_EVENT,
	MemberAddedEvent,
	DUE_DATE_REMINDER_EVENT,
	DueDateReminderEvent,
} from "./events/notification-events";

@Injectable()
export class NotificationEventsListener {
	private readonly logger = new Logger(NotificationEventsListener.name);

	constructor(private readonly notificationService: NotificationService) {}

	/**
	 * Handles task assignment notifications.
	 * Skips if actor and assignee are the same user (self-assignment).
	 * Validates: Requirements 1.1, 1.2, 1.3
	 */
	@OnEvent(TASK_ASSIGNED_EVENT)
	async handleTaskAssigned(event: TaskAssignedEvent): Promise<void> {
		// Requirement 1.3: skip self-assignment
		if (event.actorUserId === event.assigneeUserId) return;

		try {
			await this.notificationService.createAndDeliver({
				userId: event.assigneeUserId,
				title: `You were assigned to: ${event.taskTitle}`,
				message: `${event.actorDisplayName} assigned you to task "${event.taskTitle}"`,
				referenceType: "task",
				referenceId: event.taskId,
				isRead: false,
				isArchived: false,
			});
		} catch (err) {
			this.logger.error("Failed to create task-assigned notification", {
				event,
				err,
			});
		}
	}

	/**
	 * Handles task completion notifications sent to the project owner.
	 * Skips if the actor (who completed the task) is the project owner themselves.
	 * Validates: Requirements 2.1, 2.2, 2.3
	 */
	@OnEvent(TASK_COMPLETED_EVENT)
	async handleTaskCompleted(event: TaskCompletedEvent): Promise<void> {
		// Requirement 2.3: skip if actor is the project owner
		if (event.actorUserId === event.projectOwnerId) return;

		try {
			await this.notificationService.createAndDeliver({
				userId: event.projectOwnerId,
				title: `Task completed: ${event.taskTitle}`,
				message: `${event.actorDisplayName} completed task "${event.taskTitle}"`,
				referenceType: "task",
				referenceId: event.taskId,
				isRead: false,
				isArchived: false,
			});
		} catch (err) {
			this.logger.error("Failed to create task-completed notification", {
				event,
				err,
			});
		}
	}

	/**
	 * Handles milestone creation notifications for all non-owner project members.
	 * Iterates over recipientUserIds and creates one notification per recipient.
	 * Individual failures are caught and logged without stopping delivery to other recipients.
	 * Validates: Requirements 3.1, 3.4
	 */
	@OnEvent(MILESTONE_CREATED_EVENT)
	async handleMilestoneCreated(event: MilestoneCreatedEvent): Promise<void> {
		// Requirement 3.4: no members → nothing to do
		if (!event.recipientUserIds || event.recipientUserIds.length === 0) return;

		for (const recipientUserId of event.recipientUserIds) {
			try {
				await this.notificationService.createAndDeliver({
					userId: recipientUserId,
					title: `New milestone: ${event.milestoneTitle}`,
					message: `Milestone "${event.milestoneTitle}" was created in project "${event.projectName}"`,
					referenceType: "milestone",
					referenceId: event.milestoneId,
					isRead: false,
					isArchived: false,
				});
			} catch (err) {
				this.logger.error("Failed to create milestone-created notification", {
					recipientUserId,
					event,
					err,
				});
				// Log and continue — do not rethrow so other recipients still get notified
			}
		}
	}

	/**
	 * Handles project member addition notifications.
	 * Skips if the actor adding the member is the same as the new member (self-addition).
	 * Validates: Requirements 5.1, 5.2
	 */
	@OnEvent(MEMBER_ADDED_EVENT)
	async handleMemberAdded(event: MemberAddedEvent): Promise<void> {
		// Requirement 5.2: skip self-addition
		if (event.actorUserId === event.newMemberUserId) return;

		try {
			await this.notificationService.createAndDeliver({
				userId: event.newMemberUserId,
				title: `You were added to: ${event.projectName}`,
				message: `${event.actorDisplayName} added you to project "${event.projectName}"`,
				referenceType: "project",
				referenceId: event.projectId,
				isRead: false,
				isArchived: false,
			});
		} catch (err) {
			this.logger.error("Failed to create member-added notification", {
				event,
				err,
			});
		}
	}

	/**
	 * Handles due-date reminder notifications for all task assignees.
	 * Iterates over assigneeUserIds and creates one reminder notification per assignee.
	 * Individual failures are caught and logged without stopping delivery to other assignees.
	 * Validates: Requirements 4.1
	 */
	@OnEvent(DUE_DATE_REMINDER_EVENT)
	async handleDueDateReminder(event: DueDateReminderEvent): Promise<void> {
		if (!event.assigneeUserIds || event.assigneeUserIds.length === 0) return;

		const dueDateString = event.dueDate.toISOString();

		for (const assigneeUserId of event.assigneeUserIds) {
			try {
				await this.notificationService.createAndDeliver({
					userId: assigneeUserId,
					title: `Reminder: "${event.taskTitle}" is due soon`,
					message: `Task "${event.taskTitle}" is due at ${dueDateString}`,
					referenceType: "task",
					referenceId: event.taskId,
					isRead: false,
					isArchived: false,
				});
			} catch (err) {
				this.logger.error("Failed to create due-date reminder notification", {
					assigneeUserId,
					event,
					err,
				});
				// Log and continue — do not rethrow so other assignees still get notified
			}
		}
	}
}
