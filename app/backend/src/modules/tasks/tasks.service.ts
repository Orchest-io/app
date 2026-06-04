import { Injectable, NotFoundException, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  BulkUpdateTasksDto,
  CreateSubtaskDto,
  UpdateSubtaskDto,
  AddTaskAssigneeDto,
  CreateTaskDependencyDto,
} from '@orchest/shared';
import { ProjectsService } from '../projects/projects.service';

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

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const oldStatus = task.status;

    this.taskRepository.merge(task, updateTaskDto);
    const savedTask = await this.taskRepository.save(task);

    // If task status changed to done, recalculate project and milestone progress
    if (updateTaskDto.status && updateTaskDto.status !== oldStatus) {
      await this.projectsService.recalculateProjectProgress(savedTask.projectId);
      if (savedTask.milestoneId) {
        // userId is not available at this level, pass empty to avoid null
        await this.projectsService.recalculateMilestoneProgress(
          savedTask.milestoneId,
          savedTask.createdBy,
        );
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
      relations: ['subtasks', 'assignees', 'assignees.user', 'dependencies'],
    });
  }

  async bulkUpdateStatus(dto: BulkUpdateTasksDto): Promise<void> {
    const progressUpdates: { projectId: string; milestoneId: string | null; createdBy: string }[] = [];

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      for (const update of dto.tasks) {
        const task = await transactionalEntityManager.findOne(Task, { where: { id: update.taskId } });
        if (!task) {
          throw new NotFoundException(`Task with ID ${update.taskId} not found`);
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
      await this.projectsService.recalculateMilestoneProgress(milestoneId, createdBy);
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

  async updateSubtask(subtaskId: string, dto: UpdateSubtaskDto): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId } });
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
    }
    this.subtaskRepository.merge(subtask, dto);
    return this.subtaskRepository.save(subtask);
  }

  async deleteSubtask(subtaskId: string): Promise<void> {
    const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId } });
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
    }
    await this.subtaskRepository.remove(subtask);
  }

  // --- Assignee Operations ---

  async addAssignee(taskId: string, dto: AddTaskAssigneeDto): Promise<TaskAssignee> {
    await this.findOne(taskId);
    
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
    return this.assigneeRepository.save(assignee);
  }

  async removeAssignee(taskId: string, userId: string): Promise<void> {
    const assignee = await this.assigneeRepository.findOne({
      where: { taskId, userId },
    });
    if (!assignee) {
      throw new NotFoundException(`Assignee connection not found for Task ${taskId} and User ${userId}`);
    }
    await this.assigneeRepository.remove(assignee);
  }

  // --- Dependency Operations ---

  async addDependency(taskId: string, dto: CreateTaskDependencyDto): Promise<TaskDependency> {
    await this.findOne(taskId);
    await this.findOne(dto.dependsOnTaskId);

    if (taskId === dto.dependsOnTaskId) {
      throw new ConflictException('A task cannot depend on itself');
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
      type: dto.type ?? 'requires',
    });
    return this.dependencyRepository.save(dependency);
  }

  async removeDependency(dependencyId: string): Promise<void> {
    const dependency = await this.dependencyRepository.findOne({ where: { id: dependencyId } });
    if (!dependency) {
      throw new NotFoundException(`Dependency with ID ${dependencyId} not found`);
    }
    await this.dependencyRepository.remove(dependency);
  }
}

