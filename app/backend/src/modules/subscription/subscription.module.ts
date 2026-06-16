import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { SubscriptionController } from './subscription.controller';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [UsersModule, AiModule],
  controllers: [SubscriptionController],
  providers: [StripeService],
  exports: [StripeService],
})
export class SubscriptionModule {}
