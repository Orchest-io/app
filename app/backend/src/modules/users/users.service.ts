import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserSettings } from './entities/user-settings.entity';
import { UserSkill } from './entities/user-skill.entity';
import { StorageService } from '../storage/storage.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSettingsDto,
  AddUserSkillDto,
} from '@orchest/shared';
import { AuthProvider } from '@orchest/shared';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
    @InjectRepository(UserSkill)
    private readonly skillRepository: Repository<UserSkill>,
    private readonly storageService: StorageService,
  ) {}

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('Avatar exceeds 2MB size limit');
    }

    const user = await this.findOne(userId);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = file.originalname.split('.').pop() || 'png';
    const storagePath = `users/${userId}/${uniqueSuffix}.${fileExt}`;

    const avatarUrl = await this.storageService.uploadFile(
      'avatars',
      storagePath,
      file.buffer,
      file.mimetype,
    );

    // Optional: delete old avatar from Supabase storage if it was stored there
    if (user.avatarUrl && user.avatarUrl.includes('supabase.co')) {
      try {
        const match = user.avatarUrl.match(/\/avatars\/(.+)$/);
        if (match && match[1]) {
          const oldPath = decodeURIComponent(match[1]);
          await this.storageService.deleteFile('avatars', oldPath);
        }
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    user.avatarUrl = avatarUrl;
    return this.userRepository.save(user);
  }

  // ─── Register ──────────────────────────────────────────────────────

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check for duplicate email
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Hash the password if provided
    let passwordHash: string | undefined;
    if (createUserDto.passwordHash) {
      passwordHash = await bcrypt.hash(createUserDto.passwordHash, SALT_ROUNDS);
    }

    const user = this.userRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      authProvider: AuthProvider.LOCAL,
    });
    await this.userRepository.save(user);

    // Create default settings
    const settings = this.settingsRepository.create({ userId: user.id });
    await this.settingsRepository.save(settings);

    return user;
  }

  // ─── Login ─────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Use a generic message to avoid user enumeration
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.passwordHash) {
      // Account was created via Google OAuth — no password set
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please sign in with Google.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Update last login timestamp
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    user.lastLoginAt = new Date();

    return user;
  }

  // ─── CRUD ──────────────────────────────────────────────────────────

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['settings', 'skills'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.passwordHash) {
      updateUserDto.passwordHash = await bcrypt.hash(
        updateUserDto.passwordHash,
        SALT_ROUNDS,
      );
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // ─── Delete Account (with password confirmation) ──────────────────

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.findOne(userId);

    // Check if user has a password (not OAuth-only)
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please contact support to delete your account.',
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Password is incorrect.');
    }

    // Delete user (cascades to settings, sessions, etc.)
    await this.userRepository.remove(user);
  }

  async updateSettings(
    id: string,
    updateSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    const user = await this.findOne(id);
    let settings = await this.settingsRepository.findOne({
      where: { userId: user.id },
    });
    if (!settings) {
      settings = this.settingsRepository.create({
        userId: user.id,
        ...updateSettingsDto,
      });
    } else {
      Object.assign(settings, updateSettingsDto);
    }
    return this.settingsRepository.save(settings);
  }

  async addSkill(id: string, addSkillDto: AddUserSkillDto): Promise<UserSkill> {
    const user = await this.findOne(id);
    const skill = this.skillRepository.create({
      userId: user.id,
      skillName: addSkillDto.skillName,
    });
    return this.skillRepository.save(skill);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  // ─── Change Password ───────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne(userId);

    // Check if user has a password (not OAuth-only)
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in and does not have a password.',
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await this.userRepository.update(userId, { passwordHash: newPasswordHash });
  }

  // ─── Session Management ────────────────────────────────────────────

  /**
   * Create a new session when user logs in
   */
  async createSession(data: {
    userId: string;
    sessionToken: string;
    deviceInfo?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    // Deactivate old sessions for this device (optional - keep last 5 active)
    const existingSessions = await this.sessionRepository.find({
      where: { userId: data.userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (existingSessions.length >= 5) {
      // Keep only the 4 most recent, deactivate the rest
      const toDeactivate = existingSessions.slice(4);
      for (const session of toDeactivate) {
        await this.sessionRepository.update(session.id, { isActive: false });
      }
    }

    // Create new session
    const session = this.sessionRepository.create({
      ...data,
      isActive: true,
      lastActiveAt: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActiveAt: 'DESC' },
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionRepository.update(sessionId, { isActive: false });
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({ isActive: false })
      .where('userId = :userId', { userId })
      .andWhere('id != :currentSessionId', { currentSessionId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  /**
   * Update session last active time
   */
  async updateSessionActivity(sessionToken: string): Promise<void> {
    await this.sessionRepository.update(
      { sessionToken },
      { lastActiveAt: new Date() },
    );
  }

  // ─── Google OAuth ──────────────────────────────────────────────────

  async findOrCreateByGoogle(data: {
    email: string;
    fullName: string;
    avatarUrl?: string;
    authProviderId: string;
  }): Promise<User> {
    // Find by Google sub ID first, then by email
    let user = await this.userRepository.findOne({
      where: { authProviderId: data.authProviderId },
    });

    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() },
      });
    }

    if (user) {
      // Update avatar if it changed
      if (data.avatarUrl && user.avatarUrl !== data.avatarUrl) {
        user.avatarUrl = data.avatarUrl;
        await this.userRepository.save(user);
      }
      return user;
    }

    // Create new Google user (no password)
    const newUser = this.userRepository.create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      avatarUrl: data.avatarUrl,
      authProvider: AuthProvider.GOOGLE,
      authProviderId: data.authProviderId,
      isEmailVerified: true,
      isActive: true,
    });
    await this.userRepository.save(newUser);

    const settings = this.settingsRepository.create({ userId: (newUser as User).id });
    await this.settingsRepository.save(settings);

    return newUser as User;
  }
}
