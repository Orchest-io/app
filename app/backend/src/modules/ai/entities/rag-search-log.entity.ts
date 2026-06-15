import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('rag_search_logs')
export class RagSearchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'query_text', type: 'text' })
  queryText: string;

  @Column({ 
    name: 'query_embedding',
    type: 'jsonb',
    nullable: true,
  })
  queryEmbedding: number[];

  @Column({ name: 'results_count', type: 'int', default: 0 })
  resultsCount: number;

  @Column({ name: 'top_project_ids', type: 'uuid', array: true, nullable: true })
  topProjectIds: string[];

  @Column({ name: 'search_duration_ms', type: 'int', nullable: true })
  searchDurationMs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
