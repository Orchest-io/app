import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Check } from 'typeorm';
import { Task } from './task.entity';
import { DependencyType } from '@orchest/shared';

@Entity('task_dependencies')
@Unique(['taskId', 'dependsOnTaskId'])
@Check(`"taskId" != "dependsOnTaskId"`)
export class TaskDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, task => task.dependencies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'uuid' })
  dependsOnTaskId: string;

  @ManyToOne(() => Task, task => task.dependentOn, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dependsOnTaskId' })
  dependsOnTask: Task;

  @Column({ type: 'enum', enum: DependencyType, default: DependencyType.BLOCKS })
  type: DependencyType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
