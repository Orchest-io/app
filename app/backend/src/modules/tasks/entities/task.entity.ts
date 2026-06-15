import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subtask } from './subtask.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TaskDependency } from './task-dependency.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'milestone_id', type: 'uuid', nullable: true })
  milestoneId: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true }) // feature | bug | improvement
  type: string;

  @Column({ type: 'varchar', nullable: true }) // backlog | todo | in-progress | review | done
  status: string;

  @Column({ type: 'varchar', nullable: true }) // low | medium | high | urgent
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  label: string;

  @Column({ name: 'story_points', type: 'int', nullable: true })
  storyPoints: number;

  @Column({ name: 'is_ai_suggested', type: 'boolean', default: false })
  isAiSuggested: boolean;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'estimated_hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimatedHours: number;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  actualHours: number;

  @Column({ name: 'ai_complexity_vector', type: 'vector' as any, length: 1536, nullable: true })
  aiComplexityVector: number[];

   @Column({ name: 'ai_risk_score', type: 'vector' as any, length: 1536, nullable: true })
  aiRiskScore: number[];

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne('Project', 'tasks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @ManyToOne('Milestone', 'tasks', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'milestone_id' })
  milestone: any;

  @ManyToOne('User', 'createdTasks', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: any;

  @OneToMany(() => Subtask, (subtask) => subtask.task)
  subtasks: Subtask[];

  @OneToMany(() => TaskAssignee, (assignee) => assignee.task)
  assignees: TaskAssignee[];

  @OneToMany(() => TaskDependency, (dependency) => dependency.task)
  dependencies: TaskDependency[];

  @OneToMany(() => TaskDependency, (dependency) => dependency.dependsOnTask)
  dependentOn: TaskDependency[];

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];

  @OneToMany('TimeEntry', 'task')
  timeEntries: any[];

  @OneToMany('AiEstimation', 'task')
  aiEstimations: any[];
}
