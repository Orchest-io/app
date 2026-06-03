import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_budgets')
export class ProjectBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', unique: true })
  projectId: string;

  @Column({ name: 'total_allocated', type: 'decimal', precision: 10, scale: 2 })
  totalAllocated: number;

  @Column({ name: 'total_spent', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  totalSpent: number;

  @Column({ name: 'estimated_remaining', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedRemaining: number;

  @OneToOne(() => Project, (project) => project.budget, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
