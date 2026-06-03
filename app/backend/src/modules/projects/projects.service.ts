import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectMember, Milestone } from './entities';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@orchest/shared';

export interface ProjectFilterQuery {
  search?: string;
  status?: string;
  priority?: string;
}

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

  async findAll(userId: string, filters?: ProjectFilterQuery): Promise<Project[]> {
    const qb = this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'member', 'member.userId = :userId', { userId });

    if (filters?.search) {
      qb.andWhere(
        '(LOWER(project.name) LIKE :search OR LOWER(project.description) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    if (filters?.status) {
      qb.andWhere('project.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      qb.andWhere('project.priority = :priority', { priority: filters.priority });
    }

    return qb.getMany();
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

  async getMembers(projectId: string): Promise<ProjectMember[]> {
    return this.projectMembersRepository.find({ where: { projectId } });
  }

  async updateMemberRole(projectId: string, userId: string, dto: UpdateProjectMemberDto): Promise<ProjectMember> {
    const member = await this.projectMembersRepository.findOne({ where: { projectId, userId } });
    if (!member) throw new NotFoundException('Project member not found');
    await this.projectMembersRepository.update(member.id, dto);
    const updated = await this.projectMembersRepository.findOne({ where: { id: member.id } });
    if (!updated) throw new NotFoundException('Project member not found after update');
    return updated;
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
