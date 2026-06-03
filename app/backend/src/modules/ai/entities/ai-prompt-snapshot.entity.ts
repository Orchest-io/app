import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ai_prompt_snapshots')
export class AiPromptSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'creation_prompt_id', type: 'uuid' })
  creationPromptId: string;

  @Column({ name: 'prompt_version_metadata', type: 'jsonb', nullable: true })
  promptVersionMetadata: any;

  @Column({ name: 'prompt_text_at_generation', type: 'text', nullable: true })
  promptTextAtGeneration: string;
}
