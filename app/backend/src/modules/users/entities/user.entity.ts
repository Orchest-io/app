import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AuthProvider, UserAvailability } from '@orchest/shared';
import { UserSession } from './user-session.entity';
import { UserSettings } from './user-settings.entity';
import { UserSkill } from './user-skill.entity';

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

  @Column({ name: 'role_title', type: 'varchar', nullable: true })
  roleTitle: string;

  @Column({
    name: 'auth_provider',
    type: 'enum',
    enum: AuthProvider,
    nullable: true,
  })
  authProvider: AuthProvider;

  @Column({ name: 'auth_provider_id', type: 'varchar', nullable: true })
  authProviderId: string;

  @Column({
    type: 'enum',
    enum: UserAvailability,
    nullable: true,
  })
  availability: UserAvailability;

  @Column({ name: 'workload_percent', type: 'int', nullable: true })
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
}
