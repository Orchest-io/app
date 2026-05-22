import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('ai_plan_sessions')
export class AiPlanSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ type: 'jsonb', nullable: true })
  generated_plan: any;

  @Column({ type: 'jsonb', nullable: true })
  generated_structure_snapshot: any;

  @Column({ type: 'jsonb', nullable: true })
  proposed_milestones_snapshot: any;

  @Column({ type: 'jsonb', nullable: true })
  proposed_tasks_snapshot: any;

  @Column({ type: 'varchar', nullable: true }) // proposed | accepted | rejected | archived
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
