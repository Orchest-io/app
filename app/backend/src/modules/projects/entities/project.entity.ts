import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProjectMember } from './project-member.entity';
import { Milestone } from './milestone.entity';
import { ProjectScopedRole } from './project-scoped-role.entity';
import { ProjectPermissionsDef } from './project-permissions-def.entity';
import { ProjectBudget } from './project-budget.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true }) // planning | active | completed | archived
  status: string;

  @Column({ type: 'varchar', nullable: true }) // low | medium | high
  priority: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_ai_generated', type: 'boolean', default: false })
  isAiGenerated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @OneToMany(() => ProjectScopedRole, (role) => role.project)
  roles: ProjectScopedRole[];

  @OneToMany(() => ProjectPermissionsDef, (permDef) => permDef.project)
  permissionsDefs: ProjectPermissionsDef[];

  @OneToOne(() => ProjectBudget, (budget) => budget.project)
  budget: ProjectBudget;

  @OneToMany('Task', 'project')
  tasks: any[];

  @OneToMany('ActivityLog', 'project')
  activityLogs: any[];

  @OneToMany('Report', 'project')
  reports: any[];

  @OneToMany('AiPlanSession', 'project')
  aiPlanSessions: any[];

  @OneToMany('TimeEntry', 'project')
  timeEntries: any[];
}
