import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Check } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_dependencies')
@Unique(['taskId', 'dependsOnTaskId'])
@Check(`"task_id" != "depends_on_task_id"`)
export class TaskDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, task => task.dependencies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'depends_on_task_id', type: 'uuid' })
  dependsOnTaskId: string;

  @ManyToOne(() => Task, task => task.dependentOn, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'depends_on_task_id' })
  dependsOnTask: Task;

  @Column({ type: 'varchar', nullable: true }) // blocks | requires
  type: string;
}
