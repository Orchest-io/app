import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectMembership } from '../../projects/entities/project-membership.entity';

@Entity('task_assignments')
export class TaskAssignment {
  @Column({ name: 'task_id', type: 'uuid', primary: true })
  taskId: string;

  @Column({ name: 'user_id', type: 'uuid', primary: true })
  userId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Task, (task) => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'task_id', referencedColumnName: 'taskId' },
    { name: 'project_id', referencedColumnName: 'projectId' }
  ])
  task: Task;

  @ManyToOne(() => User, (user) => user.taskAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ProjectMembership, (membership) => membership.taskAssignments, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'user_id', referencedColumnName: 'userId' },
    { name: 'project_id', referencedColumnName: 'projectId' }
  ])
  membership: ProjectMembership;
}
