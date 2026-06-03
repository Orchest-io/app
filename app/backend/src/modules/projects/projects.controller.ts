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
  findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.remove(id, userId);
  }

  // Members
  @Post(':id/members')
  addMember(@Request() req, @Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.addMember(id, dto, userId);
  }

  @Delete(':id/members/:memberUserId')
  removeMember(@Request() req, @Param('id') id: string, @Param('memberUserId') memberUserId: string) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.removeMember(id, memberUserId, userId);
  }

  // Milestones
  @Post(':id/milestones')
  createMilestone(@Request() req, @Param('id') id: string, @Body() dto: CreateMilestoneDto) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.createMilestone(id, dto, userId);
  }

  @Patch('milestones/:milestoneId')
  updateMilestone(@Request() req, @Param('milestoneId') milestoneId: string, @Body() dto: UpdateMilestoneDto) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.updateMilestone(milestoneId, dto, userId);
  }

  @Delete('milestones/:milestoneId')
  removeMilestone(@Request() req, @Param('milestoneId') milestoneId: string) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.projectsService.removeMilestone(milestoneId, userId);
  }
}
