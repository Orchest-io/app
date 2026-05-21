import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiPlanSession } from './ai-plan-session.entity';
import { AiPlanItemType } from '@orchest/shared';

@Entity('ai_plan_items')
export class AiPlanItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @ManyToOne(() => AiPlanSession, session => session.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: AiPlanSession;

  @Column({ type: 'enum', enum: AiPlanItemType })
  item_type: AiPlanItemType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  estimated_hours: number;

  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'int', nullable: true })
  sort_order: number;

  @Column({ type: 'boolean', default: false })
  is_accepted: boolean;

  @CreateDateColumn()
  created_at: Date;
}
