import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import {
  CreateAiPlanSessionDto,
  UpdateAiPlanSessionDto,
  CreateAiPlanItemDto,
  UpdateAiPlanItemDto,
  CreateAiEstimationDto,
  UpdateAiEstimationDto,
  CreateAiTaskInsightDto,
  UpdateAiTaskInsightDto,
  CreateAiConversationDto,
  UpdateAiConversationDto,
  CreateAiMessageDto,
  UpdateAiMessageDto,
} from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {

  constructor(private readonly aiService: AiService) {}

  // // AiPlanSession
  // @Post('plan-sessions')
  // createPlanSession(@Body() dto: CreateAiPlanSessionDto) {
  //   return this.aiService.createPlanSession(dto);
  // }

  // @Get('plan-sessions')
  // findAllPlanSessions() {
  //   return this.aiService.findAllPlanSessions();
  // }

  // @Get('plan-sessions/:id')
  // findOnePlanSession(@Param('id') id: string) {
  //   return this.aiService.findOnePlanSession(id);
  // }

  // @Patch('plan-sessions/:id')
  // updatePlanSession(@Param('id') id: string, @Body() dto: UpdateAiPlanSessionDto) {
  //   return this.aiService.updatePlanSession(id, dto);
  // }

  // @Delete('plan-sessions/:id')
  // removePlanSession(@Param('id') id: string) {
  //   return this.aiService.removePlanSession(id);
  // }

  // // AiPlanItem
  // @Post('plan-items')
  // createPlanItem(@Body() dto: CreateAiPlanItemDto) {
  //   return this.aiService.createPlanItem(dto);
  // }

  // @Get('plan-items')
  // findAllPlanItems() {
  //   return this.aiService.findAllPlanItems();
  // }

  // @Patch('plan-items/:id')
  // updatePlanItem(@Param('id') id: string, @Body() dto: UpdateAiPlanItemDto) {
  //   return this.aiService.updatePlanItem(id, dto);
  // }

  // @Delete('plan-items/:id')
  // removePlanItem(@Param('id') id: string) {
  //   return this.aiService.removePlanItem(id);
  // }

  // // AiEstimation
  // @Post('estimations')
  // createEstimation(@Body() dto: CreateAiEstimationDto) {
  //   return this.aiService.createEstimation(dto);
  // }

  // @Get('estimations')
  // findAllEstimations() {
  //   return this.aiService.findAllEstimations();
  // }

  // @Patch('estimations/:id')
  // updateEstimation(@Param('id') id: string, @Body() dto: UpdateAiEstimationDto) {
  //   return this.aiService.updateEstimation(id, dto);
  // }

  // @Delete('estimations/:id')
  // removeEstimation(@Param('id') id: string) {
  //   return this.aiService.removeEstimation(id);
  // }

  // // AiTaskInsight
  // @Post('task-insights')
  // createTaskInsight(@Body() dto: CreateAiTaskInsightDto) {
  //   return this.aiService.createTaskInsight(dto);
  // }

  // @Get('task-insights')
  // findAllTaskInsights() {
  //   return this.aiService.findAllTaskInsights();
  // }

  // @Patch('task-insights/:id')
  // updateTaskInsight(@Param('id') id: string, @Body() dto: UpdateAiTaskInsightDto) {
  //   return this.aiService.updateTaskInsight(id, dto);
  // }

  // @Delete('task-insights/:id')
  // removeTaskInsight(@Param('id') id: string) {
  //   return this.aiService.removeTaskInsight(id);
  // }

  // // AiConversation
  // @Post('conversations')
  // createConversation(@Body() dto: CreateAiConversationDto) {
  //   return this.aiService.createConversation(dto);
  // }

  // @Get('conversations')
  // findAllConversations() {
  //   return this.aiService.findAllConversations();
  // }

  // @Patch('conversations/:id')
  // updateConversation(@Param('id') id: string, @Body() dto: UpdateAiConversationDto) {
  //   return this.aiService.updateConversation(id, dto);
  // }

  // @Delete('conversations/:id')
  // removeConversation(@Param('id') id: string) {
  //   return this.aiService.removeConversation(id);
  // }

  // // AiMessage
  // @Post('messages')
  // createMessage(@Body() dto: CreateAiMessageDto) {
  //   return this.aiService.createMessage(dto);
  // }

  // @Get('messages')
  // findAllMessages() {
  //   return this.aiService.findAllMessages();
  // }

  // @Patch('messages/:id')
  // updateMessage(@Param('id') id: string, @Body() dto: UpdateAiMessageDto) {
  //   return this.aiService.updateMessage(id, dto);
  // }

  // @Delete('messages/:id')
  // removeMessage(@Param('id') id: string) {
  //   return this.aiService.removeMessage(id);
  // }
}
