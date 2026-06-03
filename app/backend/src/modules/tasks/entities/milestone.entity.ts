import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Task } from './task.entity';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid', { name: 'milestone_id' })
  milestoneId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'target_date', type: 'timestamp', nullable: true })
  targetDate: Date | null;

  @ManyToOne(() => Project, (project) => project.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Task, (task) => task.milestone)
  tasks: Task[];
}
