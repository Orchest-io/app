import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ai_insights_logs')
export class AiInsightsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'initiated_by', type: 'uuid' })
  initiatedBy: string;

  @Column({ name: 'reference_type', type: 'varchar', nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'insight_type', type: 'varchar', nullable: true })
  insightType: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'insight_embedding', type: 'vector' as any, length: 1536, nullable: true })
  insightEmbedding: number[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  score: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Relations
  @ManyToOne('Project', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiated_by' })
  initiator: User;
}
