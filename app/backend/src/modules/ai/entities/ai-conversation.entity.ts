import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { AiMessage } from './ai-message.entity';

@Entity('ai_conversations')
export class AiConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'context_type', type: 'varchar', nullable: true }) // general | project | task
  contextType: string;

  @Column({ name: 'context_id', type: 'uuid', nullable: true })
  contextId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => AiMessage, message => message.conversation)
  messages: AiMessage[];
}
