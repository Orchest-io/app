import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';
import { CreateTaskDto, UpdateTaskDto, TaskStatus } from '@orchest/shared';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto as any);
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
<<<<<<< HEAD
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
=======
    this.taskRepository.merge(task, updateTaskDto as any);
    return this.taskRepository.save(task);
>>>>>>> main
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
