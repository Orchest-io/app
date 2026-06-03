import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@orchest/shared';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.create(userId, createProjectDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.findAll(userId, { search, status, priority });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  // Members
  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.projectsService.addMember(id, dto);
  }

  @Patch(':id/members/:userId')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMemberRole(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(id, userId);
  }

  // Milestones
  @Post(':id/milestones')
  createMilestone(@Param('id') id: string, @Body() dto: CreateMilestoneDto) {
    return this.projectsService.createMilestone(id, dto);
  }

  @Patch('milestones/:milestoneId')
  updateMilestone(@Param('milestoneId') milestoneId: string, @Body() dto: UpdateMilestoneDto) {
    return this.projectsService.updateMilestone(milestoneId, dto);
  }

  @Delete('milestones/:milestoneId')
  removeMilestone(@Param('milestoneId') milestoneId: string) {
    return this.projectsService.removeMilestone(milestoneId);
  }
}
