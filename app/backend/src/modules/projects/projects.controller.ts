import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@orchest/shared';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.create(userId, createProjectDto);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.findAll(userId);
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
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.projectsService.addMember(id, dto);
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
