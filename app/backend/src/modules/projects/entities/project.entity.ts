import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from './permission.entity';
import { Role } from './role.entity';
import { ProjectMembership } from './project-membership.entity';
import { Milestone } from '../../tasks/entities/milestone.entity';
import { Task } from '@/modules/tasks/entities';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid', { name: 'project_id' })
  projectId: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'mode', type: 'enum', enum: ['Team', 'Freelancer'] })
  mode: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.projectsCreated)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Permission, (permission) => permission.project)
  permissions: Permission[];

  @OneToMany(() => Role, (role) => role.project)
  roles: Role[];

  @OneToMany(() => ProjectMembership, (membership) => membership.project)
  memberships: ProjectMembership[];

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
