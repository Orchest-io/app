import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { Notification } from './entities';

export interface MessageEvent {
  data: string | object;
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly MAX_CONNECTIONS_PER_USER = 5;

  /** userId → ordered list of subjects (oldest first) */
  private connections = new Map<string, Subject<MessageEvent>[]>();

  /** subject → keepalive interval handle */
  private keepaliveIntervals = new Map<Subject<MessageEvent>, ReturnType<typeof setInterval>>();

  /**
   * Called by NotificationController when a client connects.
   * Creates a new Subject, evicts the oldest if count would exceed the limit,
   * adds to the map, and returns the Subject as an Observable.
   */
  register(userId: string): Observable<MessageEvent> {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, []);
    }

    const subjects = this.connections.get(userId)!;

    // Evict oldest if at the limit
    if (subjects.length >= this.MAX_CONNECTIONS_PER_USER) {
      this.evictOldest(userId);
    }

    const subject = new Subject<MessageEvent>();
    subjects.push(subject);

    const keepaliveInterval = setInterval(() => {
      try {
        subject.next({ data: ': keepalive' });
      } catch {
        // subject may be closed — will be cleaned up on next push
      }
    }, 30_000);
    this.keepaliveIntervals.set(subject, keepaliveInterval);

    return subject.asObservable();
  }

  /**
   * Called by NotificationController when the client disconnects.
   * Removes the given subject from the map entry.
   */
  unregister(userId: string, subject: Subject<MessageEvent>): void {
    const subjects = this.connections.get(userId);
    if (!subjects) return;

    const idx = subjects.indexOf(subject);
    if (idx !== -1) {
      subjects.splice(idx, 1);
    }

    const interval = this.keepaliveIntervals.get(subject);
    if (interval !== undefined) {
      clearInterval(interval);
      this.keepaliveIntervals.delete(subject);
    }

    if (subjects.length === 0) {
      this.connections.delete(userId);
    }
  }

  /**
   * Push a notification payload to all active connections for a user.
   * Catches errors from dead subjects and removes them.
   */
  push(userId: string, payload: Notification): void {
    const subjects = this.connections.get(userId);
    if (!subjects || subjects.length === 0) return;

    const deadSubjects: Subject<MessageEvent>[] = [];

    for (const subject of subjects) {
      try {
        subject.next({ data: JSON.stringify(payload) });
      } catch (err) {
        this.logger.warn('Dead SSE subject detected, removing', { userId });
        deadSubjects.push(subject);
      }
    }

    // Clean up dead subjects
    for (const dead of deadSubjects) {
      this.unregister(userId, dead);
    }
  }

  /** Completes and removes the first (oldest) subject in the array */
  private evictOldest(userId: string): void {
    const subjects = this.connections.get(userId);
    if (!subjects || subjects.length === 0) return;

    const oldest = subjects.shift();
    if (oldest) {
      const interval = this.keepaliveIntervals.get(oldest);
      if (interval !== undefined) {
        clearInterval(interval);
        this.keepaliveIntervals.delete(oldest);
      }
      try {
        oldest.complete();
      } catch {
        // already closed — ignore
      }
    }
  }
}
