import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_estimations')
export class AiEstimation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'description_embedding', type: 'vector' as any, length: 1536, nullable: true })
  descriptionEmbedding: number[];

  @Column({ name: 'estimated_hours', type: 'int', nullable: true })
  estimatedHours: number;

  @Column({ name: 'confidence_score', type: 'int', nullable: true }) // 0-100
  confidenceScore: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
