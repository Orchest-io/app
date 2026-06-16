import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	ConflictException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Project, ProjectMember, Milestone, ProjectStoryPointConfig } from "./entities";
import { Task } from "../tasks/entities/task.entity";
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  AssignTasksToMilestoneDto,
  ProjectMemberRole,
  MilestoneStatus,
  TaskStatus,
  ActivityAction,
  EntityType,
  NotificationType,
  ReferenceType,
  UpdateStoryPointConfigDto,
} from "@orchest/shared";
import { ActivityLogService } from "../analytics/activity-log.service";
import { NotificationService } from "../analytics/notification.service";
import { UsersService } from "../users/users.service";
import {
	MILESTONE_CREATED_EVENT,
	MilestoneCreatedEvent,
	MEMBER_ADDED_EVENT,
	MemberAddedEvent,
} from "../analytics/events/notification-events";

@Injectable()
export class ProjectsService {
	constructor(
		@InjectRepository(Project)
		private projectsRepository: Repository<Project>,
		@InjectRepository(ProjectMember)
		private projectMembersRepository: Repository<ProjectMember>,
		@InjectRepository(Milestone)
		private milestonesRepository: Repository<Milestone>,
		@InjectRepository(ProjectStoryPointConfig)
		private storyPointConfigRepository: Repository<ProjectStoryPointConfig>,
		@InjectRepository(Task)
		private tasksRepository: Repository<Task>,
		private readonly activityLogService: ActivityLogService,
		private readonly notificationService: NotificationService,
		private readonly usersService: UsersService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	private async getMemberRole(
		projectId: string,
		userId: string,
	): Promise<ProjectMemberRole | null> {
		const member = await this.projectMembersRepository.findOne({
			where: { projectId, userId },
		});
		return member ? (member.role as ProjectMemberRole) : null;
	}

	private async requireMember(
		projectId: string,
		userId: string,
	): Promise<ProjectMemberRole> {
		const role = await this.getMemberRole(projectId, userId);
		if (!role)
			throw new ForbiddenException("You are not a member of this project");
		return role;
	}

	private async requireOwner(projectId: string, userId: string): Promise<void> {
		const role = await this.getMemberRole(projectId, userId);
		if (role !== ProjectMemberRole.OWNER) {
			throw new ForbiddenException(
				"Only the project owner can perform this action",
			);
		}
	}

	async create(
		userId: string,
		createProjectDto: CreateProjectDto,
	): Promise<Project> {
		return await this.projectsRepository.manager.transaction(async (manager) => {
			// Extract storyPointConfigs to prevent them from being passed to Project entity
			const { storyPointConfigs, ...projectData } = createProjectDto;

			const project = manager.create(Project, {
				...projectData,
				createdBy: userId,
			});
			const savedProject = await manager.save(project);

			// Add creator as owner
			const member = manager.create(ProjectMember, {
				projectId: savedProject.id,
				userId: userId,
				role: ProjectMemberRole.OWNER,
			});
			await manager.save(member);

			// Seed Story Point Configurations
			let configsToSave = storyPointConfigs;
			if (!configsToSave || configsToSave.length === 0) {
				// Default preset
				configsToSave = [
					{ storyPointValue: 1, hoursEquivalent: 4 },
					{ storyPointValue: 2, hoursEquivalent: 8 },
					{ storyPointValue: 3, hoursEquivalent: 16 },
					{ storyPointValue: 5, hoursEquivalent: 40 },
					{ storyPointValue: 8, hoursEquivalent: 80 },
					{ storyPointValue: 13, hoursEquivalent: 120 },
				];
			}

			const spEntities = configsToSave.map(c => 
				manager.create(ProjectStoryPointConfig, {
					projectId: savedProject.id,
					storyPointValue: c.storyPointValue,
					hoursEquivalent: c.hoursEquivalent,
				})
			);
			await manager.save(spEntities);

			// Log activity (using the injected service outside transaction is generally okay here 
			// because if transaction fails it throws and doesn't reach the event emission, 
			// though strictly it's better to await it after transaction. We'll do it after to be safe.)
			return savedProject;
		}).then(async (savedProject) => {
			// After transaction commits
			await this.activityLogService.create(userId, {
				project_id: savedProject.id,
				action: ActivityAction.CREATED,
				entity_type: EntityType.PROJECT,
				entity_id: savedProject.id,
				description: `Project "${savedProject.name}" created`,
			});

			// Emit event for RAG indexing (non-blocking)
			this.eventEmitter.emit('project.created', { projectId: savedProject.id });

			return savedProject;
		});
	}

	async findAll(userId: string): Promise<Project[]> {
		return this.projectsRepository
			.createQueryBuilder("project")
			.innerJoin("project.members", "member", "member.userId = :userId", {
				userId,
			})
			.getMany();
	}

	async findOne(id: string, userId?: string): Promise<Project> {
		const project = await this.projectsRepository.findOne({
			where: { id },
			relations: ["members", "members.user", "milestones"],
		});
		if (!project) throw new NotFoundException("Project not found");
		return project;
	}

	async update(
		id: string,
		updateProjectDto: UpdateProjectDto,
		userId: string,
	): Promise<Project> {
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

			const members = await this.projectMembersRepository.find({
				where: { projectId: id },
			});
			for (const member of members) {
				await this.notificationService.create({
					userId: member.userId,
					type: NotificationType.UPDATE,
					title: `Project status updated`,
					message: `Status changed from "${oldStatus}" to "${updateProjectDto.status}"`,
					referenceType: ReferenceType.PROJECT,
					referenceId: id,
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

	async addMemberByEmail(
		projectId: string,
		email: string,
		role: ProjectMemberRole,
		requesterId: string,
		jobTitle?: string,
		skills?: string,
		status?: string,
	): Promise<ProjectMember> {
		await this.requireOwner(projectId, requesterId);

		// Find user by email
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new NotFoundException(`User with email "${email}" not found`);
		}

		// Check for existing membership (409 conflict)
		const existing = await this.projectMembersRepository.findOne({
			where: { projectId, userId: user.id },
		});
		if (existing) {
			throw new ConflictException("User is already a member of this project");
		}

		const member = this.projectMembersRepository.create({
			projectId,
			userId: user.id,
			role,
			jobTitle: jobTitle || null,
			skills: skills || null,
			status: status || "available",
		});
		const savedMember = await this.projectMembersRepository.save(member);

		// Log activity
		await this.activityLogService.create(requesterId, {
			project_id: projectId,
			action: ActivityAction.UPDATED,
			entity_type: EntityType.PROJECT,
			entity_id: projectId,
			description: `User ${user.email} added to project as ${jobTitle || role}`,
		});

		// Notify the added user (skip if fails to avoid blocking)
		try {
			const project = await this.projectsRepository.findOne({
				where: { id: projectId },
			});
			const actor = await this.usersService
				.findOne(requesterId)
				.catch((): null => null);
			this.eventEmitter.emit(MEMBER_ADDED_EVENT, {
				projectId,
				projectName: project?.name ?? "",
				newMemberUserId: user.id,
				actorUserId: requesterId,
				actorDisplayName: actor?.fullName ?? "A team member",
			} satisfies MemberAddedEvent);
		} catch (error) {
			console.error("Failed to emit member added event:", error);
		}

		return savedMember;
	}

	async addMember(
		projectId: string,
		dto: AddProjectMemberDto,
		requesterId: string,
	): Promise<ProjectMember> {
		await this.requireOwner(projectId, requesterId);

		// Check for existing membership (409 conflict)
		const existing = await this.projectMembersRepository.findOne({
			where: { projectId, userId: dto.userId },
		});
		if (existing) {
			throw new ConflictException("User is already a member of this project");
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

		// Emit MEMBER_ADDED_EVENT (non-fatal)
		try {
			const project = await this.projectsRepository.findOne({
				where: { id: projectId },
			});
			const actor = await this.usersService
				.findOne(requesterId)
				.catch((): null => null);
			this.eventEmitter.emit(MEMBER_ADDED_EVENT, {
				projectId,
				projectName: project?.name ?? "",
				newMemberUserId: dto.userId,
				actorUserId: requesterId,
				actorDisplayName: actor?.fullName ?? "A team member",
			} satisfies MemberAddedEvent);
		} catch (err) {
			// Non-fatal
		}

		return savedMember;
	}

	async removeMember(
		projectId: string,
		memberUserId: string,
		requesterId: string,
	): Promise<void> {
		await this.requireOwner(projectId, requesterId);

		// Cannot remove the owner
		const memberRole = await this.getMemberRole(projectId, memberUserId);
		if (memberRole === ProjectMemberRole.OWNER) {
			throw new UnprocessableEntityException(
				"The project owner cannot be removed",
			);
		}

		await this.projectMembersRepository.delete({
			projectId,
			userId: memberUserId,
		});
	}

	async createMilestone(
		projectId: string,
		dto: CreateMilestoneDto,
		userId: string,
	): Promise<Milestone> {
		await this.requireMember(projectId, userId);

		const milestone = this.milestonesRepository.create({
			projectId,
			...dto,
		});
		const saved = await this.milestonesRepository.save(milestone);

		// Emit MILESTONE_CREATED_EVENT (non-fatal)
		try {
			const project = await this.projectsRepository.findOne({
				where: { id: projectId },
			});
			const allMembers = await this.projectMembersRepository.find({
				where: { projectId },
			});
			const recipientUserIds = allMembers
				.filter((m) => m.userId !== project?.createdBy)
				.map((m) => m.userId);
			if (recipientUserIds.length > 0) {
				this.eventEmitter.emit(MILESTONE_CREATED_EVENT, {
					milestoneId: saved.id,
					milestoneTitle: saved.title,
					projectId,
					projectName: project?.name ?? "",
					recipientUserIds,
				} satisfies MilestoneCreatedEvent);
			}
		} catch (err) {
			// Non-fatal: notification failure should not block the response
		}

		return saved;
	}

	async updateMilestone(
		milestoneId: string,
		dto: UpdateMilestoneDto,
		userId: string,
	): Promise<Milestone> {
		const milestone = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!milestone) throw new NotFoundException("Milestone not found");

		await this.requireMember(milestone.projectId, userId);

		const oldStatus = milestone.status;
		await this.milestonesRepository.update(milestoneId, dto);

		// If milestone is now completed, log activity and notify
		if (
			dto.status === MilestoneStatus.COMPLETED &&
			oldStatus !== MilestoneStatus.COMPLETED
		) {
			await this.activityLogService.create(userId, {
				project_id: milestone.projectId,
				action: ActivityAction.COMPLETED,
				entity_type: EntityType.MILESTONE,
				entity_id: milestoneId,
				description: `Milestone "${milestone.title}" completed`,
			});

			const members = await this.projectMembersRepository.find({
				where: { projectId: milestone.projectId },
			});
			for (const member of members) {
				await this.notificationService.create({
					userId: member.userId,
					type: NotificationType.UPDATE,
					title: `Milestone completed: ${milestone.title}`,
					referenceType: ReferenceType.MILESTONE,
					referenceId: milestoneId,
				});
			}
		}

		const updated = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!updated) throw new NotFoundException("Milestone not found");
		return updated;
	}

	async removeMilestone(milestoneId: string, userId: string): Promise<void> {
		const milestone = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!milestone) throw new NotFoundException("Milestone not found");

		await this.requireOwner(milestone.projectId, userId);

		await this.milestonesRepository.delete(milestoneId);
	}

	async recalculateProjectProgress(projectId: string): Promise<void> {
		const totalTasks = await this.tasksRepository.count({
			where: { projectId },
		});
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

	async recalculateMilestoneProgress(
		milestoneId: string,
		userId: string,
	): Promise<void> {
		const milestone = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!milestone) return;

		const totalTasks = await this.tasksRepository.count({
			where: { milestoneId },
		});
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
			await this.milestonesRepository.update(milestoneId, {
				status: MilestoneStatus.COMPLETED,
			});

			await this.activityLogService.create(userId, {
				project_id: milestone.projectId,
				action: ActivityAction.COMPLETED,
				entity_type: EntityType.MILESTONE,
				entity_id: milestoneId,
				description: `Milestone "${milestone.title}" auto-completed (all tasks done)`,
			});

			const members = await this.projectMembersRepository.find({
				where: { projectId: milestone.projectId },
			});
			for (const member of members) {
				await this.notificationService.create({
					userId: member.userId,
					type: NotificationType.UPDATE,
					title: `Milestone completed: ${milestone.title}`,
					referenceType: ReferenceType.MILESTONE,
					referenceId: milestoneId,
				});
			}
		}
	}

	// --- Milestone-Task relationship methods ---

	async getMilestones(
		projectId: string,
		userId: string,
	): Promise<(Milestone & { taskCount: number; doneCount: number })[]> {
		await this.requireMember(projectId, userId);

		const milestones = await this.milestonesRepository.find({
			where: { projectId },
			order: { createdAt: 'ASC' },
		});

		// Attach task counts per milestone
		const result = await Promise.all(
			milestones.map(async (ms) => {
				const taskCount = await this.tasksRepository.count({
					where: { milestoneId: ms.id },
				});
				const doneCount = await this.tasksRepository.count({
					where: { milestoneId: ms.id, status: TaskStatus.DONE },
				});
				return { ...ms, taskCount, doneCount };
			}),
		);

		return result;
	}

	async getMilestoneTasks(milestoneId: string, userId: string): Promise<Task[]> {
		const milestone = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!milestone) throw new NotFoundException('Milestone not found');
		await this.requireMember(milestone.projectId, userId);

		return this.tasksRepository.find({
			where: { milestoneId },
			relations: ['subtasks', 'assignees', 'assignees.user'],
			order: { createdAt: 'ASC' },
		});
	}

	async assignTasksToMilestone(
		milestoneId: string,
		dto: AssignTasksToMilestoneDto,
		userId: string,
	): Promise<void> {
		const milestone = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!milestone) throw new NotFoundException('Milestone not found');
		await this.requireMember(milestone.projectId, userId);

		if (dto.taskIds.length === 0) return;

		// Validate all tasks belong to the same project
		const tasks = await this.tasksRepository.find({
			where: { id: In(dto.taskIds) },
		});

		const wrongProject = tasks.find((t) => t.projectId !== milestone.projectId);
		if (wrongProject) {
			throw new UnprocessableEntityException(
				`Task ${wrongProject.id} does not belong to this project`,
			);
		}

		await this.tasksRepository.update(
			{ id: In(dto.taskIds) },
			{ milestoneId },
		);

		await this.recalculateMilestoneProgress(milestoneId, userId);
	}

	async unassignTaskFromMilestone(
		milestoneId: string,
		taskId: string,
		userId: string,
	): Promise<void> {
		const milestone = await this.milestonesRepository.findOne({
			where: { id: milestoneId },
		});
		if (!milestone) throw new NotFoundException('Milestone not found');
		await this.requireMember(milestone.projectId, userId);

		const task = await this.tasksRepository.findOne({ where: { id: taskId } });
		if (!task) throw new NotFoundException('Task not found');

		if (task.milestoneId !== milestoneId) {
			throw new UnprocessableEntityException(
				'Task is not assigned to this milestone',
			);
		}

		await this.tasksRepository.update({ id: taskId }, { milestoneId: null });
		await this.recalculateMilestoneProgress(milestoneId, userId);
	}

	// --- Story Point Calibration ---

	async getStoryPointConfig(projectId: string, userId: string) {
		await this.requireMember(projectId, userId);

		const configs = await this.storyPointConfigRepository.find({
			where: { projectId },
			order: { storyPointValue: 'ASC' },
		});

		if (configs.length > 0) {
			return configs.map(c => ({
				storyPointValue: c.storyPointValue,
				hoursEquivalent: Number(c.hoursEquivalent),
			}));
		}

		// Return default preset
		return [
			{ storyPointValue: 1, hoursEquivalent: 4 },
			{ storyPointValue: 2, hoursEquivalent: 8 },
			{ storyPointValue: 3, hoursEquivalent: 16 },
			{ storyPointValue: 5, hoursEquivalent: 40 },
			{ storyPointValue: 8, hoursEquivalent: 80 },
		];
	}

	async updateStoryPointConfig(
		projectId: string,
		dto: UpdateStoryPointConfigDto,
		userId: string,
	) {
		await this.requireOwner(projectId, userId);

		// Clear existing
		await this.storyPointConfigRepository.delete({ projectId });

		// Save new
		const entities = dto.configs.map(c => 
			this.storyPointConfigRepository.create({
				projectId,
				storyPointValue: c.storyPointValue,
				hoursEquivalent: c.hoursEquivalent,
			})
		);
		
		await this.storyPointConfigRepository.save(entities);

		// Re-trigger RAG indexing so it learns the new mapping
		this.eventEmitter.emit('project.created', { projectId });

		return this.getStoryPointConfig(projectId, userId);
	}
}
