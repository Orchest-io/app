import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('project_embeddings')
export class ProjectEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;


  @Column({ 
    type: 'vector',
    length: 1536, 
  })
  embedding: number[];

  @Column({ name: 'content_type', length: 50 })
  contentType: 'project_summary' | 'milestone' | 'task' | 'retrospective';

  @Column({ name: 'content_text', type: 'text' })
  contentText: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
