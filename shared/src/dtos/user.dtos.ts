import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { AuthProvider, UserAvailability, ThemeMode } from '../enums/user.enums';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  roleTitle?: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @IsOptional()
  @IsString()
  authProviderId?: string;

  @IsOptional()
  @IsEnum(UserAvailability)
  availability?: UserAvailability;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  workloadPercent?: number;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  roleTitle?: string;

  @IsOptional()
  @IsEnum(UserAvailability)
  availability?: UserAvailability;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  workloadPercent?: number;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsEnum(ThemeMode)
  theme?: ThemeMode;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  aiSuggestions?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}

export class AddUserSkillDto {
  @IsString()
  skillName: string;
}
