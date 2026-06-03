import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../modules/users/users.service';

// Extend Express Request to include the authenticated user
declare module 'express' {
  interface Request {
    user?: any;
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.substring(7).trim();
      if (userId) {
        try {
          const user = await this.usersService.findOne(userId);
          if (user) {
            req.user = user;
          }
        } catch (err) {
          // Catch not found errors and keep req.user undefined
        }
      }
    }

    const path = req.originalUrl || req.path || '';
    const isProjectsRoute = path.includes('/projects');

    if (isProjectsRoute && !req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    next();
  }
}
