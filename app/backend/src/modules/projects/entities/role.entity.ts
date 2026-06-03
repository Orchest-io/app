import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { Permission } from './permission.entity';
import { ProjectMembership } from './project-membership.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
@Unique(['projectId', 'roleName'])
@Unique(['projectId', 'roleId'])
export class Role {
  @PrimaryGeneratedColumn('uuid', { name: 'role_id' })
  roleId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'role_name', type: 'varchar' })
  roleName: string;

  @ManyToOne(() => Project, (project) => project.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'roleId' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'permissionId' },
  })
  permissions: Permission[];

  @OneToMany(() => ProjectMembership, (membership) => membership.role)
  memberships: ProjectMembership[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];
}
