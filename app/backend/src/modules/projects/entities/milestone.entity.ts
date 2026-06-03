import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'ai_creation_prompt_id', type: 'uuid', nullable: true })
  aiCreationPromptId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'target_date', type: 'date', nullable: true })
  targetDate: Date;

  @Column({ name: 'is_ai_generated', type: 'boolean', default: false })
  isAiGenerated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Project, (project) => project.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
