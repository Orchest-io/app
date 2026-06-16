import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiPlanSession } from './entities/ai-plan-session.entity';
import { AiEstimation } from './entities/ai-estimation.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiMessage } from './entities/ai-message.entity';
import { AiJob } from './entities/ai-job.entity';
import { AiUsageLog } from './entities/ai-usage-log.entity';
import { ProjectEmbedding } from './entities/project-embedding.entity';
import { RagSearchLog } from './entities/rag-search-log.entity';

// Import new services
import { OpenAIService } from './services/openai.service';
import { AiJobService } from './services/ai-job.service';
import { AiUsageService } from './services/ai-usage.service';
import { AiAgentsService } from './services/ai-agents.service';
import { AiPipelineService } from './services/ai-pipeline.service';
import { AiRagService } from './services/ai-rag.service';
import { AiAssistantService } from './services/ai-assistant.service';
import { AiTaskGeneratorService } from './services/ai-task-generator.service';

// Import dependencies
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiPlanSession,
      AiEstimation,
      AiConversation,
      AiMessage,
      AiJob,
      AiUsageLog,
      ProjectEmbedding,
      RagSearchLog,
    ]),
    EventEmitterModule.forRoot(),
    UsersModule,
    forwardRef(() => ProjectsModule),
    forwardRef(() => TasksModule),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    OpenAIService,
    AiJobService,
    AiUsageService,
    AiAgentsService,
    AiPipelineService,
    AiRagService,
    AiAssistantService,
    AiTaskGeneratorService,
  ],
  exports: [AiService, AiRagService, AiUsageService],
})
export class AiModule {}
