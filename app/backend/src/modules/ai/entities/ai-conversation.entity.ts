import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AiMessage } from './ai-message.entity';
import { AiContextType } from '@orchest/shared';

@Entity('ai_conversations')
export class AiConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'enum', enum: AiContextType, nullable: true })
  context_type: AiContextType;

  @Column({ type: 'uuid', nullable: true })
  context_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AiMessage, message => message.conversation)
  messages: AiMessage[];
}
