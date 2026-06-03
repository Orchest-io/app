import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { ProjectRolePermission } from './project-role-permission.entity';
import { ProjectMember } from './project-member.entity';

@Entity('project_scoped_roles')
export class ProjectScopedRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'role_name', type: 'varchar' })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => ProjectRolePermission, (rp) => rp.role)
  rolePermissions: ProjectRolePermission[];

  @OneToMany(() => ProjectMember, (member) => member.projectScopedRole)
  members: ProjectMember[];
}
