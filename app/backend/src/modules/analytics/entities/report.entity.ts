import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportSnapshot } from './report-snapshot.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'generated_by', type: 'uuid' })
  generatedBy: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true }) // performance | velocity | financial | team | projects | executive
  type: string;

  @Column({ type: 'varchar', nullable: true }) // generating | ready | failed
  status: string;

  @Column({ type: 'varchar', nullable: true }) // pdf | csv | json
  format: string;

  @Column({ name: 'file_url', type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ name: 'generated_at', type: 'timestamp', nullable: true })
  generatedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'generated_by' })
  generatedByUser: User;

  // String reference to avoid circular cross-module import
  @ManyToOne('Project', 'reports', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @OneToMany(() => ReportSnapshot, (snapshot) => snapshot.report)
  snapshots: ReportSnapshot[];
}
