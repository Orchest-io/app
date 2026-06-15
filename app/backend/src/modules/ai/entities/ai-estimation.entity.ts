import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("ai_estimations")
export class AiEstimation {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "task_id", type: "uuid", nullable: true })
	taskId: string | null;

	@Column({ name: "project_id", type: "uuid", nullable: true })
	projectId: string | null;

	@Column({ name: "user_id", type: "uuid" })
	userId: string;

	@Column({
		name: "description_embedding",
		type: "vector" as any,
		length: 1536,
		nullable: true,
	})
	descriptionEmbedding: number[];

	@Column({ name: "estimated_hours", type: "int", nullable: true })
	estimatedHours: number;

	@Column({ name: "confidence_score", type: "int", nullable: true }) // 0-100
	confidenceScore: number;

	@CreateDateColumn({ name: "created_at", type: "timestamp" })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.aiEstimations, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn({ name: "user_id" })
	user: User;

	// String references to avoid circular cross-module imports
	@ManyToOne("Task", "aiEstimations", { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "task_id" })
	task: any;

	@ManyToOne("Project", { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "project_id" })
	project: any;
}
