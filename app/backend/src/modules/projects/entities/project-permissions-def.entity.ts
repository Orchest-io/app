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

@Entity('project_permissions_def')
export class ProjectPermissionsDef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'permission_key', type: 'varchar' })
  permissionKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.permissionsDefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => ProjectRolePermission, (rp) => rp.permissionDef)
  rolePermissions: ProjectRolePermission[];
}
