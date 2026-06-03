import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserSettings } from './entities/user-settings.entity';
import { UserSkill } from './entities/user-skill.entity';
import { CreateUserDto, UpdateUserDto, UpdateUserSettingsDto, AddUserSkillDto } from '@orchest/shared';

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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
    
    // Create default settings
    const settings = this.settingsRepository.create({ userId: user.id });
    await this.settingsRepository.save(settings);

    return user;
  }

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
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateSettings(id: string, updateSettingsDto: UpdateUserSettingsDto): Promise<UserSettings> {
    const user = await this.findOne(id);
    let settings = await this.settingsRepository.findOne({ where: { userId: user.id } });
    if (!settings) {
      settings = this.settingsRepository.create({ userId: user.id, ...updateSettingsDto });
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
    return this.userRepository.findOne({ where: { email } });
  }
}
