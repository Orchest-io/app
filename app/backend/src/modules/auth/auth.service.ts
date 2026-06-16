import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateUserDto } from '@orchest/shared';

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  email: string;
  fullName: string;
  avatarUrl?: string;
  authProviderId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Parse User-Agent to get device info
   */
  private parseUserAgent(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';

    // Simple parser (you can use ua-parser-js for better results)
    let device = 'Unknown Device';

    if (userAgent.includes('Windows')) device = 'Windows';
    else if (userAgent.includes('Mac OS')) device = 'macOS';
    else if (userAgent.includes('Linux')) device = 'Linux';
    else if (userAgent.includes('iPhone')) device = 'iPhone';
    else if (userAgent.includes('iPad')) device = 'iPad';
    else if (userAgent.includes('Android')) device = 'Android';

    let browser = '';
    if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';

    return browser ? `${browser} on ${device}` : device;
  }

  private async generateTokens(userId: string, email: string, requestInfo?: { ipAddress?: string; userAgent?: string }) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '15m' }, // 15 minutes
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' }, // 7 days
    );

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.refreshTokenRepository.save({
      userId,
      tokenHash: hashedRefreshToken,
      expiresAt,
      isActive: true,
    });

    // Create session if request info provided
    if (requestInfo) {
      const deviceInfo = this.parseUserAgent(requestInfo.userAgent || '');
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 days

      await this.usersService.createSession({
        userId,
        sessionToken: accessToken, // Use access token as session identifier
        deviceInfo,
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress,
        expiresAt: sessionExpiresAt,
      });
    }

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto, requestInfo?: { ipAddress?: string; userAgent?: string }) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create user (UsersService.create handles password hashing)
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: dto.password,
      isEmailVerified: true,
      isActive: true,
    });

    // Generate tokens and create session
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, requestInfo);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto, requestInfo?: { ipAddress?: string; userAgent?: string }) {
    // Find user
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has password (not OAuth only)
    if (!user.passwordHash) {
      throw new UnauthorizedException('Please use social login for this account');
    }

    // Debug logging
    console.log('=== LOGIN DEBUG ===');
    console.log('Email:', dto.email);
    console.log('Password from request:', dto.password);
    console.log('Password hash from DB:', user.passwordHash);
    console.log('Password length:', dto.password.length);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    console.log('Password valid:', isPasswordValid);
    console.log('==================');
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens and create session
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, requestInfo);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleAuth(dto: GoogleAuthDto, requestInfo?: { ipAddress?: string; userAgent?: string }) {
    // Find or create user
    let user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      // Create new user
      user = await this.usersService.create({
        fullName: dto.fullName,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
        authProvider: 'GOOGLE' as any,
        authProviderId: dto.authProviderId,
        isEmailVerified: true,
        isActive: true,
      });
    }

    // Generate tokens and create session
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, requestInfo);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(oldRefreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(oldRefreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find all active refresh tokens for this user
      const storedTokens = await this.refreshTokenRepository.find({
        where: { userId: payload.sub, isActive: true },
      });

      // Check if any stored token matches
      let tokenFound = false;
      for (const stored of storedTokens) {
        const isMatch = await bcrypt.compare(oldRefreshToken, stored.tokenHash);
        if (isMatch) {
          tokenFound = true;
          // Invalidate old refresh token
          await this.refreshTokenRepository.update(stored.id, { isActive: false });
          break;
        }
      }

      if (!tokenFound) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const storedTokens = await this.refreshTokenRepository.find({
        where: { userId: payload.sub, isActive: true },
      });

      for (const stored of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, stored.tokenHash);
        if (isMatch) {
          await this.refreshTokenRepository.update(stored.id, { isActive: false });
          break;
        }
      }
    } catch (error) {
      // Silently handle invalid/expired tokens to prevent user enumeration
    }
    return { success: true };
  }
}
