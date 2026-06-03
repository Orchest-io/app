import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  ManyToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { Role } from './role.entity';

@Entity('permissions')
@Unique(['projectId', 'permissionName'])
export class Permission {
  @PrimaryGeneratedColumn('uuid', { name: 'permission_id' })
  permissionId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'permission_name', type: 'varchar' })
  permissionName: string;

  @ManyToOne(() => Project, (project) => project.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
