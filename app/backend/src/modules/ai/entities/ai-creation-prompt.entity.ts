import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AiPromptSnapshot } from './ai-prompt-snapshot.entity';

@Entity('ai_creation_prompts')
export class AiCreationPrompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'primary_prompt_text', type: 'text' })
  primaryPromptText: string;

  @Column({ name: 'prompt_type', type: 'varchar', nullable: true }) // initial_generation | restructuring
  promptType: string;

  @Column({ name: 'context_tags', type: 'varchar', nullable: true })
  contextTags: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // String reference to avoid circular cross-module import
  @ManyToOne('Project', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => AiPromptSnapshot, (snapshot) => snapshot.creationPrompt)
  snapshots: AiPromptSnapshot[];
}
