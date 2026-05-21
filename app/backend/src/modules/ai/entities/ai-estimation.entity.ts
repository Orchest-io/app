import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AiComplexity } from '@orchest/shared';

@Entity('ai_estimations')
export class AiEstimation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  task_id: string;

  @Column({ type: 'varchar' })
  task_description: string;

  @Column({ type: 'int', nullable: true })
  estimated_hours: number;

  @Column({ type: 'int', nullable: true })
  confidence_percent: number;

  @Column({ type: 'enum', enum: AiComplexity, nullable: true })
  complexity_label: AiComplexity;

  @Column({ type: 'jsonb', nullable: true })
  similar_tasks_data: any;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: any;

  @CreateDateColumn()
  created_at: Date;
}
