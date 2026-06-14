// Feature: notification-system
// Validates: Requirements 4.1, 4.2, 4.3, 4.4
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task } from '../tasks/entities/task.entity';
import {
  DUE_DATE_REMINDER_EVENT,
  DueDateReminderEvent,
} from './events/notification-events';

@Injectable()
export class DueDateSchedulerService {
  private readonly logger = new Logger(DueDateSchedulerService.name);

  /**
   * Tracks which tasks have already received a reminder for their current dueDate.
   * Key: taskId, Value: dueDate for which the reminder was sent.
   * Requirement 4.2: reset when dueDate changes, enabling a fresh reminder.
   * Requirement 4.3: cancelled (deleted) when task is marked done.
   */
  private sentReminders = new Map<string, Date>();

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Runs every 5 minutes to detect tasks within the 24-hour due-date window.
   *
   * Window logic:
   *   - Standard window: 23h55m–24h5m before dueDate (normal scheduled reminder)
   *   - Immediate: dueDate < now + 24h (for tasks whose dueDate was recently
   *     updated to be within the next 24 hours — Requirement 4.4)
   *
   * Deduplication (Requirement 4.2):
   *   Skip tasks whose current dueDate already matches the value recorded in
   *   sentReminders — prevents duplicate reminders on repeated scheduler ticks.
   *
   * Validates: Requirements 4.1, 4.2, 4.4
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkDueDates(): Promise<void> {
    try {
      // Query all non-done tasks that have a dueDate set, eagerly loading assignees.
      // QueryBuilder used for the IS NOT NULL + status != 'done' composite filter.
      const pendingTasks = await this.taskRepo
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignees', 'assignee')
        .where('task.due_date IS NOT NULL')
        .andWhere("task.status != 'done'")
        .getMany();

      const now = new Date();
      // now + 23h55m  (lower bound of the standard window)
      const windowStart = new Date(now.getTime() + (23 * 60 + 55) * 60 * 1000);
      // now + 24h5m   (upper bound of the standard window)
      const windowEnd = new Date(now.getTime() + (24 * 60 + 5) * 60 * 1000);
      // now + 24h     (threshold for the "immediate" path — Requirement 4.4)
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      for (const task of pendingTasks) {
        const dueDate = task.dueDate;
        if (!dueDate) continue;

        // Determine whether this task is in the reminder window
        const inStandardWindow =
          dueDate >= windowStart && dueDate <= windowEnd;

        // Requirement 4.4: if dueDate < now + 24h, send immediately
        const isImmediate = dueDate < twentyFourHoursFromNow;

        if (!inStandardWindow && !isImmediate) continue;

        // Deduplication: skip if we already sent a reminder for this exact dueDate
        const alreadySentForDate = this.sentReminders.get(task.id);
        if (
          alreadySentForDate !== undefined &&
          alreadySentForDate.getTime() === dueDate.getTime()
        ) {
          continue;
        }

        // Collect assignee user IDs
        const assigneeUserIds = (task.assignees ?? []).map((a) => a.userId);

        // Emit the due-date reminder event
        const event: DueDateReminderEvent = {
          taskId: task.id,
          taskTitle: task.title,
          dueDate,
          assigneeUserIds,
        };
        this.eventEmitter.emit(DUE_DATE_REMINDER_EVENT, event);

        // Record that a reminder was sent for this dueDate (Requirement 4.2)
        this.sentReminders.set(task.id, dueDate);
      }
    } catch (err) {
      // Requirement: log errors without crashing the scheduler loop
      this.logger.error('DueDateScheduler error during checkDueDates', err);
    }
  }

  /**
   * Clears the in-memory reminder record for a task.
   * Call this when a task's dueDate is updated so the next scheduler tick
   * will treat the new dueDate as unseen and send a fresh reminder.
   * Validates: Requirement 4.2
   */
  resetReminder(taskId: string): void {
    this.sentReminders.delete(taskId);
  }

  /**
   * Removes the reminder entry for a task that has been marked as done,
   * preventing any pending reminder from being sent.
   * Validates: Requirement 4.3
   */
  cancelReminder(taskId: string): void {
    this.sentReminders.delete(taskId);
  }
}
