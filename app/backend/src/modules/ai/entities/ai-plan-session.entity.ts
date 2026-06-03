import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ai_plan_sessions')
export class AiPlanSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'initiated_by', type: 'uuid' })
  initiatedBy: string;

  @Column({ name: 'generated_plan', type: 'jsonb', nullable: true })
  generatedPlan: any;

  @Column({ name: 'generated_structure_snapshot', type: 'jsonb', nullable: true })
  generatedStructureSnapshot: any;

  @Column({ name: 'proposed_milestones_snapshot', type: 'jsonb', nullable: true })
  proposedMilestonesSnapshot: any;

  @Column({ name: 'proposed_tasks_snapshot', type: 'jsonb', nullable: true })
  proposedTasksSnapshot: any;

  @Column({ type: 'varchar', nullable: true }) // proposed | accepted | rejected | archived
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // String reference to avoid circular cross-module import
  @ManyToOne('Project', 'aiPlanSessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'initiated_by' })
  initiator: User;
}
