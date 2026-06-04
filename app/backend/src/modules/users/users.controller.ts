import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateUserSettingsDto, AddUserSkillDto } from '@orchest/shared';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/settings')
  updateSettings(@Param('id') id: string, @Body() updateSettingsDto: UpdateUserSettingsDto) {
    return this.usersService.updateSettings(id, updateSettingsDto);
  }

  @Post(':id/skills')
  addSkill(@Param('id') id: string, @Body() addSkillDto: AddUserSkillDto) {
    return this.usersService.addSkill(id, addSkillDto);
  }
}
