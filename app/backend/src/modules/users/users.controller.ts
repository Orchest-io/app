import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateUserSettingsDto, AddUserSkillDto } from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }

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
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'Account deleted successfully' };
  }

  @Patch(':id/settings')
  updateSettings(@Param('id') id: string, @Body() updateSettingsDto: UpdateUserSettingsDto) {
    return this.usersService.updateSettings(id, updateSettingsDto);
  }

  @Post(':id/skills')
  addSkill(@Param('id') id: string, @Body() addSkillDto: AddUserSkillDto) {
    return this.usersService.addSkill(id, addSkillDto);
  }

  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.changePassword(id, body.currentPassword, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @Post(':id/delete-account')
  async deleteAccount(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    await this.usersService.deleteAccount(id, body.password);
    return { message: 'Account deleted successfully' };
  }

  @Get(':id/sessions')
  async getSessions(@Param('id') id: string) {
    return this.usersService.getUserSessions(id);
  }

  @Delete(':id/sessions/:sessionId')
  async revokeSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    await this.usersService.revokeSession(sessionId, id);
    return { message: 'Session revoked successfully' };
  }

  @Post(':id/sessions/revoke-all')
  async revokeAllSessions(
    @Param('id') id: string,
    @Body() body: { currentSessionId: string },
  ) {
    await this.usersService.revokeAllOtherSessions(id, body.currentSessionId);
    return { message: 'All other sessions revoked successfully' };
  }
}
