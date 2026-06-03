import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_status_logs')
export class TaskStatusLog {
  @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
  logId: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @Column({ name: 'old_status', type: 'enum', enum: ['To Do', 'In Progress', 'Done'] })
  oldStatus: string;

  @Column({ name: 'new_status', type: 'enum', enum: ['To Do', 'In Progress', 'Done'] })
  newStatus: string;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;

  @ManyToOne(() => Task, (task) => task.statusLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;
}
