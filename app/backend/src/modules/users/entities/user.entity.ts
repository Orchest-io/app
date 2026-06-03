import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserSession } from './user-session.entity';
import { UserSettings } from './user-settings.entity';
import { UserSkill } from './user-skill.entity';
import { AuthProvider } from '@orchest/shared';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({
    name: 'auth_provider',
    type: 'varchar',
    nullable: true,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ name: 'auth_provider_id', type: 'varchar', nullable: true })
  authProviderId: string;

  @Column({ type: 'jsonb', nullable: true })
  roles: any; // global roles JSON/array

  @Column({ name: 'workload_percent', type: 'int', nullable: true, default: 0 })
  workloadPercent: number;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToOne(() => UserSettings, (settings) => settings.user)
  settings: UserSettings;

  @OneToMany(() => UserSkill, (skill) => skill.user)
  skills: UserSkill[];

  @OneToMany('Project', 'createdBy')
  createdProjects: any[];

  @OneToMany('ProjectMember', 'user')
  projectMemberships: any[];

  @OneToMany('TaskAssignee', 'user')
  taskAssignments: any[];

  @OneToMany('Comment', 'user')
  comments: any[];

  @OneToMany('Notification', 'user')
  notifications: any[];

  @OneToMany('ActivityLog', 'user')
  activityLogs: any[];

  @OneToMany('TimeEntry', 'user')
  timeEntries: any[];

  @OneToMany('AiConversation', 'user')
  aiConversations: any[];

  @OneToMany('Attachment', 'uploadedBy')
  attachments: any[];

  @OneToMany('Report', 'generatedBy')
  reports: any[];

  @OneToMany('CustomReport', 'user')
  customReports: any[];

  @OneToMany('AiEstimation', 'user')
  aiEstimations: any[];
}
