import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_story_point_configs')
@Unique(['projectId', 'storyPointValue'])
export class ProjectStoryPointConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'story_point_value', type: 'int' })
  storyPointValue: number;

  @Column({ name: 'hours_equivalent', type: 'decimal', precision: 5, scale: 2 })
  hoursEquivalent: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
