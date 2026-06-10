import {
	Injectable,
	NotFoundException,
	Inject,
	forwardRef,
	ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Task } from "./entities/task.entity";
import { Subtask } from "./entities/subtask.entity";
import { TaskAssignee } from "./entities/task-assignee.entity";
import { TaskDependency } from "./entities/task-dependency.entity";
import { Comment } from "./entities/comment.entity";
import { Attachment } from "./entities/attachment.entity";
import {
	CreateTaskDto,
	UpdateTaskDto,
	TaskStatus,
	BulkUpdateTasksDto,
	CreateSubtaskDto,
	UpdateSubtaskDto,
	AddTaskAssigneeDto,
	CreateTaskDependencyDto,
} from "@orchest/shared";
import { ProjectsService } from "../projects/projects.service";
import { UsersService } from "../users/users.service";
import { DueDateSchedulerService } from "../analytics/due-date-scheduler.service";
import {
	TASK_ASSIGNED_EVENT,
	TaskAssignedEvent,
	TASK_COMPLETED_EVENT,
	TaskCompletedEvent,
} from "../analytics/events/notification-events";

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(Subtask)
		private readonly subtaskRepository: Repository<Subtask>,
		@InjectRepository(TaskAssignee)
		private readonly assigneeRepository: Repository<TaskAssignee>,
		@InjectRepository(TaskDependency)
		private readonly dependencyRepository: Repository<TaskDependency>,
		private readonly dataSource: DataSource,
		@Inject(forwardRef(() => ProjectsService))
		private readonly projectsService: ProjectsService,
		private readonly usersService: UsersService,
		private readonly dueDateSchedulerService: DueDateSchedulerService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async create(createTaskDto: CreateTaskDto): Promise<Task> {
		const task = this.taskRepository.create(createTaskDto);
		return this.taskRepository.save(task);
	}

	async findAll(): Promise<Task[]> {
		return this.taskRepository.find();
	}

	async findOne(id: string): Promise<Task> {
		const task = await this.taskRepository.findOne({ where: { id } });
		if (!task) {
			throw new NotFoundException(`Task with ID ${id} not found`);
		}
		return task;
	}

	async update(
		id: string,
		updateTaskDto: UpdateTaskDto,
		actorUserId?: string,
	): Promise<Task> {
		const task = await this.findOne(id);
		const oldStatus = task.status;
		const oldDueDate = task.dueDate;

		this.taskRepository.merge(task, updateTaskDto);
		const savedTask = await this.taskRepository.save(task);

		// If task status changed to done, recalculate project and milestone progress
		if (updateTaskDto.status && updateTaskDto.status !== oldStatus) {
			await this.projectsService.recalculateProjectProgress(
				savedTask.projectId,
			);
			if (savedTask.milestoneId) {
				// userId is not available at this level, pass empty to avoid null
				await this.projectsService.recalculateMilestoneProgress(
					savedTask.milestoneId,
					savedTask.createdBy,
				);
			}
		}

		// Task 9.2 — Emit TASK_COMPLETED_EVENT when status changes to 'done'
		if (updateTaskDto.status === "done" && oldStatus !== "done") {
			try {
				const project = await this.projectsService.findOne(savedTask.projectId);
				const projectOwnerId = project.createdBy;
				let actorDisplayName = "A team member";
				if (actorUserId) {
					const actor = await this.usersService
						.findOne(actorUserId)
						.catch((): null => null);
					if (actor) actorDisplayName = actor.fullName;
				}
				this.eventEmitter.emit(TASK_COMPLETED_EVENT, {
					taskId: savedTask.id,
					taskTitle: savedTask.title,
					projectOwnerId,
					actorUserId: actorUserId ?? "",
					actorDisplayName,
				} satisfies TaskCompletedEvent);
				this.dueDateSchedulerService.cancelReminder(savedTask.id);
			} catch {
				// Non-fatal: notification failure should not break the update
			}
		}

		// Task 9.3 — Reset due-date reminder if dueDate was changed
		if (updateTaskDto.dueDate !== undefined) {
			const newTime = updateTaskDto.dueDate
				? new Date(updateTaskDto.dueDate).getTime()
				: null;
			const oldTime = oldDueDate ? new Date(oldDueDate).getTime() : null;
			if (newTime !== oldTime) {
				this.dueDateSchedulerService.resetReminder(savedTask.id);
			}
		}

		return savedTask;
	}

	async remove(id: string): Promise<void> {
		const task = await this.findOne(id);
		await this.taskRepository.remove(task);
	}

	// --- Kanban Board Operations ---

	async findByProject(projectId: string): Promise<Task[]> {
		return this.taskRepository.find({
			where: { projectId },
			relations: ["subtasks", "assignees", "assignees.user", "dependencies"],
		});
	}

	async bulkUpdateStatus(dto: BulkUpdateTasksDto): Promise<void> {
		const progressUpdates: {
			projectId: string;
			milestoneId: string | null;
			createdBy: string;
		}[] = [];

		await this.dataSource.transaction(async (transactionalEntityManager) => {
			for (const update of dto.tasks) {
				const task = await transactionalEntityManager.findOne(Task, {
					where: { id: update.taskId },
				});
				if (!task) {
					throw new NotFoundException(
						`Task with ID ${update.taskId} not found`,
					);
				}

				const oldStatus = task.status;
				task.status = update.status;

				const savedTask = await transactionalEntityManager.save(task);
				if (update.status !== oldStatus) {
					progressUpdates.push({
						projectId: savedTask.projectId,
						milestoneId: savedTask.milestoneId,
						createdBy: savedTask.createdBy,
					});
				}
			}
		});

		// Recalculate progress for affected projects/milestones after transaction commits
		const uniqueProjects = new Set<string>();
		const uniqueMilestones = new Map<string, string>();

		for (const update of progressUpdates) {
			uniqueProjects.add(update.projectId);
			if (update.milestoneId) {
				uniqueMilestones.set(update.milestoneId, update.createdBy);
			}
		}

		for (const projectId of uniqueProjects) {
			await this.projectsService.recalculateProjectProgress(projectId);
		}
		for (const [milestoneId, createdBy] of uniqueMilestones.entries()) {
			await this.projectsService.recalculateMilestoneProgress(
				milestoneId,
				createdBy,
			);
		}
	}

	// --- Subtask Operations ---

	async createSubtask(taskId: string, dto: CreateSubtaskDto): Promise<Subtask> {
		await this.findOne(taskId);
		const subtask = this.subtaskRepository.create({
			taskId,
			title: dto.title,
			isCompleted: false,
		});
		return this.subtaskRepository.save(subtask);
	}

	async updateSubtask(
		subtaskId: string,
		dto: UpdateSubtaskDto,
	): Promise<Subtask> {
		const subtask = await this.subtaskRepository.findOne({
			where: { id: subtaskId },
		});
		if (!subtask) {
			throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
		}
		this.subtaskRepository.merge(subtask, dto);
		return this.subtaskRepository.save(subtask);
	}

	async deleteSubtask(subtaskId: string): Promise<void> {
		const subtask = await this.subtaskRepository.findOne({
			where: { id: subtaskId },
		});
		if (!subtask) {
			throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
		}
		await this.subtaskRepository.remove(subtask);
	}

	// --- Assignee Operations ---

	async addAssignee(
		taskId: string,
		dto: AddTaskAssigneeDto,
		actorUserId?: string,
	): Promise<TaskAssignee> {
		const task = await this.findOne(taskId);

		const existing = await this.assigneeRepository.findOne({
			where: { taskId, userId: dto.userId },
		});
		if (existing) {
			return existing;
		}

		const assignee = this.assigneeRepository.create({
			taskId,
			userId: dto.userId,
			isPrimary: dto.isPrimary ?? false,
		});
		const saved = await this.assigneeRepository.save(assignee);

		// Task 9.1 — Emit TASK_ASSIGNED_EVENT after saving the new assignee
		try {
			let actorDisplayName = "A team member";
			if (actorUserId) {
				const actor = await this.usersService
					.findOne(actorUserId)
					.catch((): null => null);
				if (actor) actorDisplayName = actor.fullName;
			}
			this.eventEmitter.emit(TASK_ASSIGNED_EVENT, {
				taskId,
				taskTitle: task.title,
				assigneeUserId: dto.userId,
				actorUserId: actorUserId ?? "",
				actorDisplayName,
			} satisfies TaskAssignedEvent);
		} catch {
			// Non-fatal: notification failure should not break the assignee addition
		}

		return saved;
	}

	async removeAssignee(taskId: string, userId: string): Promise<void> {
		const assignee = await this.assigneeRepository.findOne({
			where: { taskId, userId },
		});
		if (!assignee) {
			throw new NotFoundException(
				`Assignee connection not found for Task ${taskId} and User ${userId}`,
			);
		}
		await this.assigneeRepository.remove(assignee);
	}

	// --- Dependency Operations ---

	async addDependency(
		taskId: string,
		dto: CreateTaskDependencyDto,
	): Promise<TaskDependency> {
		await this.findOne(taskId);
		await this.findOne(dto.dependsOnTaskId);

		if (taskId === dto.dependsOnTaskId) {
			throw new ConflictException("A task cannot depend on itself");
		}

		const existing = await this.dependencyRepository.findOne({
			where: { taskId, dependsOnTaskId: dto.dependsOnTaskId },
		});
		if (existing) {
			return existing;
		}

		const dependency = this.dependencyRepository.create({
			taskId,
			dependsOnTaskId: dto.dependsOnTaskId,
			type: dto.type ?? "requires",
		});
		return this.dependencyRepository.save(dependency);
	}

	async removeDependency(dependencyId: string): Promise<void> {
		const dependency = await this.dependencyRepository.findOne({
			where: { id: dependencyId },
		});
		if (!dependency) {
			throw new NotFoundException(
				`Dependency with ID ${dependencyId} not found`,
			);
		}
		await this.dependencyRepository.remove(dependency);
	}
}
