import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectScopedRole } from './project-scoped-role.entity';
import { ProjectPermissionsDef } from './project-permissions-def.entity';

@Entity('project_role_permissions')
export class ProjectRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'permission_def_id', type: 'uuid' })
  permissionDefId: string;

  @ManyToOne(() => ProjectScopedRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: ProjectScopedRole;

  @ManyToOne(() => ProjectPermissionsDef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_def_id' })
  permissionDef: ProjectPermissionsDef;
}
