import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { AiPlanItem } from './ai-plan-item.entity';
import { AiSessionStatus } from '@orchest/shared';

@Entity('ai_plan_sessions')
export class AiPlanSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  initiated_by: string;

  @Column({ type: 'enum', enum: AiSessionStatus, default: AiSessionStatus.PENDING })
  status: AiSessionStatus;

  @Column({ type: 'jsonb', nullable: true })
  input_data: any;

  @Column({ type: 'jsonb', nullable: true })
  generated_plan: any;

  @Column({ type: 'jsonb', nullable: true })
  risk_analysis: any;

  @Column({ type: 'jsonb', nullable: true })
  resource_recommendations: any;

  @Column({ type: 'int', nullable: true })
  generation_time_ms: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => AiPlanItem, item => item.session)
  items: AiPlanItem[];
}
