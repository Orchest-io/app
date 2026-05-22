import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiPlanSession } from './entities/ai-plan-session.entity';
import { AiEstimation } from './entities/ai-estimation.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiMessage } from './entities/ai-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiPlanSession,
      AiEstimation,
      AiConversation,
      AiMessage,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
