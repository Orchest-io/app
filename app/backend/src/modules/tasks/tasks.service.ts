import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';
import { CreateTaskDto, UpdateTaskDto } from '@orchest/shared';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
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
    this.taskRepository.merge(task, updateTaskDto as any);
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  // Attachments
  async createAttachment(taskId: string, dto: {
    uploadedBy: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSizeBytes?: number;
  }): Promise<Attachment> {
    const attachment = this.attachmentRepository.create({ taskId, ...dto });
    return this.attachmentRepository.save(attachment);
  }

  async getAttachmentsByTask(taskId: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({ where: { taskId } });
  }

  async removeAttachment(attachmentId: string): Promise<void> {
    await this.attachmentRepository.delete(attachmentId);
  }
}
