import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiConversation } from './ai-conversation.entity';

@Entity('ai_messages')
export class AiMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => AiConversation, convo => convo.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: AiConversation;

  @Column({ name: 'session_fk', type: 'uuid', nullable: true })
  sessionFk: string;

  @Column({ type: 'varchar', nullable: true }) // user | assistant
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'content_embedding', type: 'vector' as any, length: 1536, nullable: true })
  contentEmbedding: number[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
