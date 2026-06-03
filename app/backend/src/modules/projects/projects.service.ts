import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectMember, Milestone } from './entities';
import { Task } from '../tasks/entities/task.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  ProjectMemberRole,
  MilestoneStatus,
  TaskStatus,
  ActivityAction,
  EntityType,
  NotificationType,
  ReferenceType,
} from '@orchest/shared';
import { ActivityLogService } from '../analytics/activity-log.service';
import { NotificationService } from '../analytics/notification.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMembersRepository: Repository<ProjectMember>,
    @InjectRepository(Milestone)
    private milestonesRepository: Repository<Milestone>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────

  private async getMemberRole(projectId: string, userId: string): Promise<ProjectMemberRole | null> {
    const member = await this.projectMembersRepository.findOne({
      where: { projectId, userId },
    });
    return member ? (member.role as ProjectMemberRole) : null;
  }

  private async requireMember(projectId: string, userId: string): Promise<ProjectMemberRole> {
    const role = await this.getMemberRole(projectId, userId);
    if (!role) throw new ForbiddenException('You are not a member of this project');
    return role;
  }

  private async requireOwner(projectId: string, userId: string): Promise<void> {
    const role = await this.getMemberRole(projectId, userId);
    if (role !== ProjectMemberRole.OWNER) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
  }

  // ─── CRUD ──────────────────────────────────────────────────────────

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      createdBy: userId,
    });
    const savedProject = await this.projectsRepository.save(project);

    // Add creator as owner
    const member = this.projectMembersRepository.create({
      projectId: savedProject.id,
      userId: userId,
      role: ProjectMemberRole.OWNER,
    });
    await this.projectMembersRepository.save(member);

    // Log activity
    await this.activityLogService.create(userId, {
      project_id: savedProject.id,
      action: ActivityAction.CREATED,
      entity_type: EntityType.PROJECT,
      entity_id: savedProject.id,
      description: `Project "${savedProject.name}" created`,
    });

    return savedProject;
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'member', 'member.userId = :userId', { userId })
      .getMany();
  }

  async findOne(id: string, userId?: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['members', 'milestones'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id);
    await this.requireOwner(id, userId);

    const oldStatus = project.status;

    await this.projectsRepository.update(id, updateProjectDto as any);

    // If status changed, log activity and notify all members
    if (updateProjectDto.status && updateProjectDto.status !== oldStatus) {
      await this.activityLogService.create(userId, {
        project_id: id,
        action: ActivityAction.UPDATED,
        entity_type: EntityType.PROJECT,
        entity_id: id,
        description: `Project status changed from "${oldStatus}" to "${updateProjectDto.status}"`,
      });

      const members = await this.projectMembersRepository.find({ where: { projectId: id } });
      for (const member of members) {
        await this.notificationService.create({
          user_id: member.userId,
          type: NotificationType.UPDATE,
          title: `Project status updated`,
          message: `Status changed from "${oldStatus}" to "${updateProjectDto.status}"`,
          reference_type: ReferenceType.PROJECT,
          reference_id: id,
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);
    await this.requireOwner(id, userId);

    // Log activity before deleting
    await this.activityLogService.create(userId, {
      project_id: id,
      action: ActivityAction.DELETED,
      entity_type: EntityType.PROJECT,
      entity_id: id,
      description: `Project deleted`,
    });

    await this.projectsRepository.delete(id);
  }

  // ─── Members ───────────────────────────────────────────────────────

  async addMember(projectId: string, dto: AddProjectMemberDto, requesterId: string): Promise<ProjectMember> {
    await this.requireOwner(projectId, requesterId);

    // Check for existing membership (409 conflict)
    const existing = await this.projectMembersRepository.findOne({
      where: { projectId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = this.projectMembersRepository.create({
      projectId,
      ...dto,
    });
    const savedMember = await this.projectMembersRepository.save(member);

    // Log activity
    await this.activityLogService.create(requesterId, {
      project_id: projectId,
      action: ActivityAction.UPDATED,
      entity_type: EntityType.PROJECT,
      entity_id: projectId,
      description: `User ${dto.userId} added to project`,
    });

    // Notify the added user
    await this.notificationService.create({
      user_id: dto.userId,
      type: NotificationType.UPDATE,
      title: 'You have been added to a project',
      reference_type: ReferenceType.PROJECT,
      reference_id: projectId,
    });

    return savedMember;
  }

  async removeMember(projectId: string, memberUserId: string, requesterId: string): Promise<void> {
    await this.requireOwner(projectId, requesterId);

    // Cannot remove the owner
    const memberRole = await this.getMemberRole(projectId, memberUserId);
    if (memberRole === ProjectMemberRole.OWNER) {
      throw new UnprocessableEntityException('The project owner cannot be removed');
    }

    await this.projectMembersRepository.delete({ projectId, userId: memberUserId });
  }

  // ─── Milestones ────────────────────────────────────────────────────

  async createMilestone(projectId: string, dto: CreateMilestoneDto, userId: string): Promise<Milestone> {
    await this.requireMember(projectId, userId);

    const milestone = this.milestonesRepository.create({
      projectId,
      ...dto,
    });
    return this.milestonesRepository.save(milestone);
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto, userId: string): Promise<Milestone> {
    const milestone = await this.milestonesRepository.findOne({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');

    await this.requireMember(milestone.projectId, userId);

    const oldStatus = milestone.status;
    await this.milestonesRepository.update(milestoneId, dto);

    // If milestone is now completed, log activity and notify
    if (dto.status === MilestoneStatus.COMPLETED && oldStatus !== MilestoneStatus.COMPLETED) {
      await this.activityLogService.create(userId, {
        project_id: milestone.projectId,
        action: ActivityAction.COMPLETED,
        entity_type: EntityType.MILESTONE,
        entity_id: milestoneId,
        description: `Milestone "${milestone.title}" completed`,
      });

      const members = await this.projectMembersRepository.find({ where: { projectId: milestone.projectId } });
      for (const member of members) {
        await this.notificationService.create({
          user_id: member.userId,
          type: NotificationType.UPDATE,
          title: `Milestone completed: ${milestone.title}`,
          reference_type: ReferenceType.MILESTONE,
          reference_id: milestoneId,
        });
      }
    }

    const updated = await this.milestonesRepository.findOne({ where: { id: milestoneId } });
    if (!updated) throw new NotFoundException('Milestone not found');
    return updated;
  }

  async removeMilestone(milestoneId: string, userId: string): Promise<void> {
    const milestone = await this.milestonesRepository.findOne({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');

    await this.requireOwner(milestone.projectId, userId);

    await this.milestonesRepository.delete(milestoneId);
  }

  // ─── Progress Auto-Calculation ────────────────────────────────────

  async recalculateProjectProgress(projectId: string): Promise<void> {
    const totalTasks = await this.tasksRepository.count({ where: { projectId } });
    if (totalTasks === 0) {
      await this.projectsRepository.update(projectId, { progress: 0 });
      return;
    }
    const doneTasks = await this.tasksRepository.count({
      where: { projectId, status: TaskStatus.DONE },
    });
    const progress = Math.round((doneTasks / totalTasks) * 100);
    await this.projectsRepository.update(projectId, { progress });
  }

  async recalculateMilestoneProgress(milestoneId: string, userId: string): Promise<void> {
    const milestone = await this.milestonesRepository.findOne({ where: { id: milestoneId } });
    if (!milestone) return;

    const totalTasks = await this.tasksRepository.count({ where: { milestoneId } });
    if (totalTasks === 0) {
      await this.milestonesRepository.update(milestoneId, { progress: 0 });
      return;
    }
    const doneTasks = await this.tasksRepository.count({
      where: { milestoneId, status: TaskStatus.DONE },
    });
    const progress = Math.round((doneTasks / totalTasks) * 100);
    await this.milestonesRepository.update(milestoneId, { progress });

    // If milestone progress hits 100, mark as completed and trigger side effects
    if (progress === 100 && milestone.status !== MilestoneStatus.COMPLETED) {
      await this.milestonesRepository.update(milestoneId, { status: MilestoneStatus.COMPLETED });

      await this.activityLogService.create(userId, {
        project_id: milestone.projectId,
        action: ActivityAction.COMPLETED,
        entity_type: EntityType.MILESTONE,
        entity_id: milestoneId,
        description: `Milestone "${milestone.title}" auto-completed (all tasks done)`,
      });

      const members = await this.projectMembersRepository.find({ where: { projectId: milestone.projectId } });
      for (const member of members) {
        await this.notificationService.create({
          user_id: member.userId,
          type: NotificationType.UPDATE,
          title: `Milestone completed: ${milestone.title}`,
          reference_type: ReferenceType.MILESTONE,
          reference_id: milestoneId,
        });
      }
    }
  }
}
