import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserSettings } from './entities/user-settings.entity';
import { UserSkill } from './entities/user-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserSettings, UserSkill])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
