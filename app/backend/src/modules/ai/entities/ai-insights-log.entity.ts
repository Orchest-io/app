import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_insights_logs')
export class AiInsightsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'propsset_id', type: 'uuid', nullable: true })
  propssetId: string;

  @Column({ name: 'initiated_fk', type: 'uuid' })
  initiatedFk: string;

  @Column({ name: 'reference_type', type: 'varchar', nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'insight_type', type: 'varchar', nullable: true })
  insightType: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'insight_embedding', type: 'jsonb', nullable: true })
  insightEmbedding: number[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  score: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
