import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiPlanSession } from './entities/ai-plan-session.entity';
import { AiPlanItem } from './entities/ai-plan-item.entity';
import { AiEstimation } from './entities/ai-estimation.entity';
import { AiTaskInsight } from './entities/ai-task-insight.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiMessage } from './entities/ai-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiPlanSession,
      AiPlanItem,
      AiEstimation,
      AiTaskInsight,
      AiConversation,
      AiMessage,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
