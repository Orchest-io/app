import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '@orchest/shared';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  // Attachments
  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  uploadAttachment(
    @Param('id') taskId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const uploadedBy = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return this.tasksService.createAttachment(taskId, {
      uploadedBy,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSizeBytes: file.size,
    });
  }

  @Get(':id/attachments')
  getAttachments(@Param('id') taskId: string) {
    return this.tasksService.getAttachmentsByTask(taskId);
  }

  @Delete('attachments/:attachmentId')
  removeAttachment(@Param('attachmentId') attachmentId: string) {
    return this.tasksService.removeAttachment(attachmentId);
  }
}
