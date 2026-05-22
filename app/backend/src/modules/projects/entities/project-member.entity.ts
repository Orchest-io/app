import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';
import { ProjectScopedRole } from './project-scoped-role.entity';

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'project_scoped_role_id', type: 'uuid' })
  projectScopedRoleId: string;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  // Relations
  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => ProjectScopedRole, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'project_scoped_role_id' })
  projectScopedRole: ProjectScopedRole;
}
