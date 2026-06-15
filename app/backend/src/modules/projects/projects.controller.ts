import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  AssignTasksToMilestoneDto,
  UpdateStoryPointConfigDto,
} from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(user.id, createProjectDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto, user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.projectsService.remove(id, user.id);
  }

  @Post(':id/members')
  addMember(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.projectsService.addMember(id, dto, user.id);
  }

  @Post(':id/members/by-email')
  async addMemberByEmail(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: { email: string; role: string; jobTitle?: string; skills?: string; status?: string },
  ) {
    return this.projectsService.addMemberByEmail(
      id,
      dto.email,
      dto.role as any,
      user.id,
      dto.jobTitle,
      dto.skills,
      dto.status,
    );
  }

  @Delete(':id/members/:memberUserId')
  removeMember(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('memberUserId') memberUserId: string) {
    return this.projectsService.removeMember(id, memberUserId, user.id);
  }

  @Get(':id/analytics')
  getProjectAnalytics(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.getProjectAnalytics(id, user.id);
  }

  @Get(':id/story-points/config')
  async getStoryPointConfig(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.getStoryPointConfig(id, user.id);
  }

  @Put(':id/story-points/config')
  async updateStoryPointConfig(
    @Param('id') id: string,
    @Body() dto: UpdateStoryPointConfigDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.updateStoryPointConfig(id, dto, user.id);
  }

  @Post(':id/milestones')
  createMilestone(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: CreateMilestoneDto) {
    return this.projectsService.createMilestone(id, dto, user.id);
  }

  @Get(':id/milestones')
  getMilestones(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.projectsService.getMilestones(id, user.id);
  }

  @Patch('milestones/:milestoneId')
  updateMilestone(@CurrentUser() user: JwtPayload, @Param('milestoneId') milestoneId: string, @Body() dto: UpdateMilestoneDto) {
    return this.projectsService.updateMilestone(milestoneId, dto, user.id);
  }

  @Delete('milestones/:milestoneId')
  removeMilestone(@CurrentUser() user: JwtPayload, @Param('milestoneId') milestoneId: string) {
    return this.projectsService.removeMilestone(milestoneId, user.id);
  }

  @Get('milestones/:milestoneId/tasks')
  getMilestoneTasks(@CurrentUser() user: JwtPayload, @Param('milestoneId') milestoneId: string) {
    return this.projectsService.getMilestoneTasks(milestoneId, user.id);
  }

  @Post('milestones/:milestoneId/tasks')
  assignTasksToMilestone(
    @CurrentUser() user: JwtPayload,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: AssignTasksToMilestoneDto,
  ) {
    return this.projectsService.assignTasksToMilestone(milestoneId, dto, user.id);
  }

  @Delete('milestones/:milestoneId/tasks/:taskId')
  unassignTaskFromMilestone(
    @CurrentUser() user: JwtPayload,
    @Param('milestoneId') milestoneId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.projectsService.unassignTaskFromMilestone(milestoneId, taskId, user.id);
  }
}
