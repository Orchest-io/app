import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectMember, Milestone } from './entities';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@orchest/shared';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMembersRepository: Repository<ProjectMember>,
    @InjectRepository(Milestone)
    private milestonesRepository: Repository<Milestone>,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create({
      ...(createProjectDto as any),
      createdBy: userId,
    });
    const savedProject = await this.projectsRepository.save(project);

    // Also add creator as owner
    const member = this.projectMembersRepository.create({
      projectId: savedProject.id,
      userId: userId,
      role: 'owner' as any,
    });
    await this.projectMembersRepository.save(member);

    return savedProject;
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectsRepository.createQueryBuilder('project')
      .innerJoin('project.members', 'member', 'member.userId = :userId', { userId })
      .getMany();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['members', 'milestones'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.projectsRepository.update(id, updateProjectDto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }

  // Members
  async addMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMember> {
    const member = this.projectMembersRepository.create({
      projectId,
      ...dto,
    });
    return this.projectMembersRepository.save(member);
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await this.projectMembersRepository.delete({ projectId, userId });
  }

  // Milestones
  async createMilestone(projectId: string, dto: CreateMilestoneDto): Promise<Milestone> {
    const milestone = this.milestonesRepository.create({
      projectId,
      ...dto,
    });
    return this.milestonesRepository.save(milestone);
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto): Promise<Milestone> {
    await this.milestonesRepository.update(milestoneId, dto);
    const milestone = await this.milestonesRepository.findOne({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    return milestone;
  }

  async removeMilestone(milestoneId: string): Promise<void> {
    await this.milestonesRepository.delete(milestoneId);
  }
}
