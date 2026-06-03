import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';
import { Role } from './role.entity';
import { TaskAssignment } from 'src/modules/tasks/entities/task-assignment.entity';

@Entity('project_memberships')
@Unique(['userId', 'projectId'])
export class ProjectMembership {
  @Column({ name: 'user_id', type: 'uuid', primary: true })
  userId: string;

  @Column({ name: 'project_id', type: 'uuid', primary: true })
  projectId: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => User, (user) => user.projectMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, (project) => project.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Role, (role) => role.memberships, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'project_id', referencedColumnName: 'projectId' },
    { name: 'role_id', referencedColumnName: 'roleId' }
  ])
  role: Role;

  @OneToMany(() => TaskAssignment, (assignment) => assignment.membership)
  taskAssignments: TaskAssignment[];
}
