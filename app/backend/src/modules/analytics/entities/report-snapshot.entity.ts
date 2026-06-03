import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';

@Entity('report_snapshots')
export class ReportSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_id', type: 'uuid' })
  reportId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'metric_name', type: 'varchar' })
  metricName: string;

  @Column({ name: 'metric_value', type: 'varchar', nullable: true })
  metricValue: string;

  @Column({ name: 'chart_data', type: 'jsonb', nullable: true })
  chartData: any;

  @CreateDateColumn({ name: 'captured_at', type: 'timestamp' })
  capturedAt: Date;

  @ManyToOne(() => Report, (report) => report.snapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
