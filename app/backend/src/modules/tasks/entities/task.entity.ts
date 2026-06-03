import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Milestone } from './milestone.entity';
import { TaskAssignment } from './task-assignment.entity';
import { TaskStatusLog } from './task-status-log.entity';

@Entity('tasks')
@Unique(['taskId', 'projectId'])
export class Task {
  @PrimaryGeneratedColumn('uuid', { name: 'task_id' })
  taskId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'milestone_id', type: 'uuid', nullable: true })
  milestoneId: string | null;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'status', type: 'enum', enum: ['To Do', 'In Progress', 'Done'] })
  status: string;

  @Column({ name: 'order_index', type: 'float' })
  orderIndex: number;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Milestone, (milestone) => milestone.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone | null;

  @OneToMany(() => TaskAssignment, (assignment) => assignment.task)
  assignments: TaskAssignment[];

  @OneToMany(() => TaskStatusLog, (log) => log.task)
  statusLogs: TaskStatusLog[];
}
