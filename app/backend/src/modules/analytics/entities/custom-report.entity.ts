import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('custom_reports')
export class CustomReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'query_config', type: 'jsonb', nullable: true })
  queryConfig: any;

  @Column({ name: 'layout_config', type: 'jsonb', nullable: true })
  layoutConfig: any;
}
