import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("knowledge_base_chunks")
export class KnowledgeBaseChunk {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "source_type", type: "varchar" }) // e.g. task, attachment
	sourceType: string;

	@Column({ name: "source_id", type: "uuid" }) // link to source table
	sourceId: string;

	@Column({ name: "text_chunk", type: "text" })
	textChunk: string;

	@Column({
		name: "embedding",
		type: "vector" as any,
		length: 1536,
		nullable: true,
	})
	embedding: number[] | null;

	@Column({ name: "embeddingSerialized", type: "text", nullable: true })
	embeddingSerialized: string;
}
