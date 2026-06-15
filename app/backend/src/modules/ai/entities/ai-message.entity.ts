import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { AiConversation } from "./ai-conversation.entity";
import { UserSession } from "../../users/entities/user-session.entity";

@Entity("ai_messages")
export class AiMessage {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "conversation_id", type: "uuid" })
	conversationId: string;

	// Tracks which browser session sent this message (useful for WS context)
	@Column({ name: "user_session_id", type: "uuid", nullable: true })
	userSessionId: string | null;

	@Column({ type: "varchar", nullable: true }) // user | assistant
	role: string;

	@Column({ type: "text" })
	content: string;

	@Column({
		name: "content_embedding",
		type: "vector" as any,
		length: 1536,
		nullable: true,
	})
	contentEmbedding: number[];

	@CreateDateColumn({ name: "created_at", type: "timestamp" })
	createdAt: Date;

	@ManyToOne(() => AiConversation, (convo) => convo.messages, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "conversation_id" })
	conversation: AiConversation;

	@ManyToOne(() => UserSession, { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "user_session_id" })
	userSession: UserSession;
}
