import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

  @Column({ name: 'prompt_type', type: 'varchar', nullable: true })
  promptType: string;

  @Column({ name: 'context_tags', type: 'varchar', nullable: true })
  contextTags: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
