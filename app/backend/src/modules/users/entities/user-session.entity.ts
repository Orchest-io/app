import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("user_sessions")
export class UserSession {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "user_id", type: "uuid" })
	userId: string;

	@ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user: User;

	@Column({ name: "session_token", type: "varchar", unique: true })
	sessionToken: string;

	@Column({ name: "device_info", type: "text", nullable: true })
	deviceInfo: string;

	@Column({ name: "user_agent", type: "text", nullable: true })
	userAgent: string;

	@Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
	ipAddress: string;

	@Column({ name: "token_hash", type: "varchar", nullable: true })
	tokenHash: string | null;

	@Column({ name: "location", type: "varchar", nullable: true })
	location: string;

	@Column({ name: "is_active", type: "boolean", default: true })
	isActive: boolean;

	@Column({
		name: "last_active_at",
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
	})
	lastActiveAt: Date;

	@CreateDateColumn({ name: "created_at", type: "timestamp" })
	createdAt: Date;

	@Column({ name: "expires_at", type: "timestamp" })
	expiresAt: Date;
}
