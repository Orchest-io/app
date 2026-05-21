import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_snapshots')
export class ReportSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @ManyToOne(() => Report, (report) => report.snapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ type: 'varchar' })
  metric_name: string;

  @Column({ type: 'decimal', nullable: true })
  metric_value: number;

  @Column({ type: 'varchar', nullable: true })
  metric_unit: string;

  @Column({ type: 'jsonb', nullable: true })
  chart_data: any;

  @CreateDateColumn({ type: 'timestamp' })
  captured_at: Date;
}
