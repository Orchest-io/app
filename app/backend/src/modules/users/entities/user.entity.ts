import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Project } from '../../projects/entities/project.entity';
import { ProjectMembership } from '@/modules/projects/entities';
import { TaskAssignment } from '../../tasks/entities/task-assignment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Project, (project) => project.creator)
  projectsCreated: Project[];

  @OneToMany(() => ProjectMembership, (membership) => membership.user)
  projectMemberships: ProjectMembership[];

  @OneToMany(() => TaskAssignment, (assignment) => assignment.user)
  taskAssignments: TaskAssignment[];
}
