import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../tasks/entities/attachment.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly storageService: StorageService,
  ) {}

  private async verifyProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }
    return member;
  }

  async uploadProjectAttachment(
    projectId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    await this.verifyProjectMember(projectId, userId);

    // Limit to 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const storagePath = `projects/${projectId}/${uniqueSuffix}-${file.originalname}`;

    // Upload to Supabase (bucket is 'attachments')
    const publicUrl = await this.storageService.uploadFile(
      'attachments',
      storagePath,
      file.buffer,
      file.mimetype,
    );

    const attachment = this.attachmentRepository.create({
      projectId,
      uploadedBy: userId,
      fileName: file.originalname,
      fileUrl: publicUrl, // Place public URL, but we will dynamically sign it
      storagePath,
      fileType: file.mimetype,
      fileSizeBytes: file.size,
    });

    const saved = await this.attachmentRepository.save(attachment);
    saved.fileUrl = await this.storageService.getSignedUrl('attachments', storagePath, 3600);
    return saved;
  }

  async uploadTaskAttachment(
    taskId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    await this.verifyProjectMember(task.projectId, userId);

    // Limit to 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const storagePath = `projects/${task.projectId}/tasks/${taskId}/${uniqueSuffix}-${file.originalname}`;

    // Upload to Supabase (bucket is 'attachments')
    const publicUrl = await this.storageService.uploadFile(
      'attachments',
      storagePath,
      file.buffer,
      file.mimetype,
    );

    const attachment = this.attachmentRepository.create({
      projectId: task.projectId,
      taskId,
      uploadedBy: userId,
      fileName: file.originalname,
      fileUrl: publicUrl,
      storagePath,
      fileType: file.mimetype,
      fileSizeBytes: file.size,
    });

    const saved = await this.attachmentRepository.save(attachment);
    saved.fileUrl = await this.storageService.getSignedUrl('attachments', storagePath, 3600);
    return saved;
  }

  async getProjectAttachments(projectId: string, userId: string): Promise<Attachment[]> {
    await this.verifyProjectMember(projectId, userId);

    const attachments = await this.attachmentRepository.find({
      where: { projectId, taskId: null },
      order: { createdAt: 'DESC' },
    });

    // Generate signed URLs for private files
    for (const attachment of attachments) {
      if (attachment.storagePath) {
        attachment.fileUrl = await this.storageService.getSignedUrl(
          'attachments',
          attachment.storagePath,
          3600,
        );
      }
    }

    return attachments;
  }

  async getTaskAttachments(taskId: string, userId: string): Promise<Attachment[]> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    await this.verifyProjectMember(task.projectId, userId);

    const attachments = await this.attachmentRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });

    // Generate signed URLs
    for (const attachment of attachments) {
      if (attachment.storagePath) {
        attachment.fileUrl = await this.storageService.getSignedUrl(
          'attachments',
          attachment.storagePath,
          3600,
        );
      }
    }

    return attachments;
  }

  async removeAttachment(id: string, userId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    // Verify membership
    const member = await this.verifyProjectMember(attachment.projectId, userId);

    // RESTRICTION: Only project owner OR the uploader can delete
    const isOwner = member.role === 'owner';
    const isUploader = attachment.uploadedBy === userId;

    if (!isOwner && !isUploader) {
      throw new ForbiddenException(
        'You do not have permission to delete this attachment. Only the uploader or project owner can delete attachments.',
      );
    }

    // Delete from Supabase Storage
    if (attachment.storagePath) {
      try {
        await this.storageService.deleteFile('attachments', attachment.storagePath);
      } catch (err) {
        // Log error and continue with database deletion to prevent hanging metadata
        console.error(`Failed to delete storage file: ${attachment.storagePath}`, err);
      }
    }

    // Delete from Database
    await this.attachmentRepository.remove(attachment);
  }
}
