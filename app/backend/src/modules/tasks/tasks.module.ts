import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';
import { KnowledgeBaseChunk } from './entities/knowledge-base-chunk.entity';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Subtask, TaskAssignee, TaskDependency, Comment, Attachment, KnowledgeBaseChunk]),
    forwardRef(() => ProjectsModule),
    UsersModule,
    AnalyticsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
