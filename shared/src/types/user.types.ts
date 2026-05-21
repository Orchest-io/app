import { AuthProvider, UserAvailability, ThemeMode } from '../enums';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  roleTitle?: string;
  authProvider?: AuthProvider;
  authProviderId?: string;
  availability?: UserAvailability;
  workloadPercent?: number;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  tokenHash: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme?: ThemeMode;
  language?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  aiSuggestions?: boolean;
  weeklyReports?: boolean;
  twoFactorEnabled?: boolean;
  preferences?: Record<string, any>;
  updatedAt: Date;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillName: string;
  createdAt: Date;
}
