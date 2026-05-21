import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProjectStatus, ProjectPriority, ProjectType, ProjectMode } from '@orchest/shared';
import { ProjectMember } from './project-member.entity';
import { Milestone } from './milestone.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Column({
    name: 'project_type',
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.MANUAL,
  })
  projectType: ProjectType;

  @Column({
    name: 'project_mode',
    type: 'enum',
    enum: ProjectMode,
    default: ProjectMode.TEAM,
  })
  projectMode: ProjectMode;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', nullable: true })
  budget: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];
}
