import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ReportType, ReportStatus, ReportFormat } from '@orchest/shared';
import { ReportSnapshot } from './report-snapshot.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id: string;

  @Column({ type: 'uuid' })
  generated_by: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportStatus })
  status: ReportStatus;

  @Column({ type: 'enum', enum: ReportFormat, nullable: true })
  format: ReportFormat;

  @Column({ type: 'varchar', nullable: true })
  file_url: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;

  @Column({ type: 'timestamp', nullable: true })
  generated_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => ReportSnapshot, (snapshot) => snapshot.report)
  snapshots: ReportSnapshot[];
}
