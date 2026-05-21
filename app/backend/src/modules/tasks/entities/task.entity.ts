import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subtask } from './subtask.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TaskDependency } from './task-dependency.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';
import { TaskType, TaskStatus, TaskPriority } from '@orchest/shared';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  milestoneId: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK })
  type: TaskType;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'integer', nullable: true })
  complexity: number;

  @Column({ type: 'integer', nullable: true })
  estimatedHours: number;

  @Column({ type: 'integer', nullable: true })
  actualHours: number;

  @Column({ type: 'integer', nullable: true })
  sortOrder: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Subtask, subtask => subtask.task)
  subtasks: Subtask[];

  @OneToMany(() => TaskAssignee, assignee => assignee.task)
  assignees: TaskAssignee[];

  @OneToMany(() => TaskDependency, dependency => dependency.task)
  dependencies: TaskDependency[];

  @OneToMany(() => TaskDependency, dependency => dependency.dependsOnTask)
  dependentOn: TaskDependency[];

  @OneToMany(() => Comment, comment => comment.task)
  comments: Comment[];

  @OneToMany(() => Attachment, attachment => attachment.task)
  attachments: Attachment[];
}
