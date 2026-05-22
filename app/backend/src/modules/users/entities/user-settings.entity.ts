import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true }) // dark | light | system
  theme: string;

  @Column({ type: 'varchar', nullable: true }) // en | es | fr | de
  language: string;

  @Column({ name: 'email_notifications', type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ name: 'push_notifications', type: 'boolean', default: true })
  pushNotifications: boolean;

  @Column({ name: 'ai_suggestions', type: 'boolean', default: true })
  aiSuggestions: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
