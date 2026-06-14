import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AiJob } from './ai-job.entity';

@Entity('ai_usage_logs')
export class AiUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  feature: string;

  @Column({ name: 'ai_job_id', type: 'uuid', nullable: true })
  aiJobId: string | null;

  @Column({ name: 'tokens_used', type: 'int', nullable: true })
  tokensUsed: number | null;

  @Column({ 
    name: 'estimated_cost', 
    type: 'decimal', 
    precision: 10, 
    scale: 6, 
    nullable: true 
  })
  estimatedCost: number | null;

  @Column({ name: 'model_used', type: 'varchar', length: 50, nullable: true })
  modelUsed: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AiJob, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ai_job_id' })
  aiJob: AiJob | null;
}
