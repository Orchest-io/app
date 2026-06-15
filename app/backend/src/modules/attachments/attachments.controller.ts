import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('project/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  uploadProjectFile(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadProjectAttachment(projectId, user.id, file);
  }

  @Post('task/:taskId')
  @UseInterceptors(FileInterceptor('file'))
  uploadTaskFile(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadTaskAttachment(taskId, user.id, file);
  }

  @Get('project/:projectId')
  getProjectFiles(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attachmentsService.getProjectAttachments(projectId, user.id);
  }

  @Get('task/:taskId')
  getTaskFiles(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attachmentsService.getTaskAttachments(taskId, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attachmentsService.removeAttachment(id, user.id);
  }
}
