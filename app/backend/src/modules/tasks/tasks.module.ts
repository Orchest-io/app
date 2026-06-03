import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Subtask, TaskAssignee, TaskDependency, Comment, Attachment]),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
