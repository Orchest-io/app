import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ReportSnapshot } from './report-snapshot.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string;

  @Column({ name: 'generated_by', type: 'uuid' })
  generatedBy: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true }) // performance | velocity | financial
  type: string;

  @Column({ type: 'varchar', nullable: true }) // generating | ready | failed
  status: string;

  @Column({ type: 'varchar', nullable: true }) // pdf | csv | json
  format: string;

  @Column({ name: 'generated_at', type: 'timestamp', nullable: true })
  generatedAt: Date;

  @OneToMany(() => ReportSnapshot, (snapshot) => snapshot.report)
  snapshots: ReportSnapshot[];
}
