import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AiInsightType, AiInsightSeverity } from '@orchest/shared';

@Entity('ai_task_insights')
export class AiTaskInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @Column({ type: 'enum', enum: AiInsightType, nullable: true })
  insight_type: AiInsightType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: AiInsightSeverity, nullable: true })
  severity: AiInsightSeverity;

  @Column({ type: 'boolean', default: false })
  is_dismissed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;
}
