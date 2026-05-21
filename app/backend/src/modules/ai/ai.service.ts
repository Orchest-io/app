import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiPlanSession } from './entities/ai-plan-session.entity';
import { AiPlanItem } from './entities/ai-plan-item.entity';
import { AiEstimation } from './entities/ai-estimation.entity';
import { AiTaskInsight } from './entities/ai-task-insight.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiMessage } from './entities/ai-message.entity';

import {
  CreateAiPlanSessionDto, UpdateAiPlanSessionDto,
  CreateAiPlanItemDto, UpdateAiPlanItemDto,
  CreateAiEstimationDto, UpdateAiEstimationDto,
  CreateAiTaskInsightDto, UpdateAiTaskInsightDto,
  CreateAiConversationDto, UpdateAiConversationDto,
  CreateAiMessageDto, UpdateAiMessageDto
} from '@orchest/shared';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiPlanSession) private aiPlanSessionRepo: Repository<AiPlanSession>,
    @InjectRepository(AiPlanItem) private aiPlanItemRepo: Repository<AiPlanItem>,
    @InjectRepository(AiEstimation) private aiEstimationRepo: Repository<AiEstimation>,
    @InjectRepository(AiTaskInsight) private aiTaskInsightRepo: Repository<AiTaskInsight>,
    @InjectRepository(AiConversation) private aiConversationRepo: Repository<AiConversation>,
    @InjectRepository(AiMessage) private aiMessageRepo: Repository<AiMessage>,
  ) {}

  // AiPlanSession
  async createPlanSession(dto: CreateAiPlanSessionDto) {
    const session = this.aiPlanSessionRepo.create(dto);
    return await this.aiPlanSessionRepo.save(session);
  }

  async findAllPlanSessions() {
    return await this.aiPlanSessionRepo.find({ relations: ['items'] });
  }

  async findOnePlanSession(id: string) {
    const session = await this.aiPlanSessionRepo.findOne({ where: { id }, relations: ['items'] });
    if (!session) throw new NotFoundException('AiPlanSession not found');
    return session;
  }

  async updatePlanSession(id: string, dto: UpdateAiPlanSessionDto) {
    const session = await this.findOnePlanSession(id);
    Object.assign(session, dto);
    return await this.aiPlanSessionRepo.save(session);
  }

  async removePlanSession(id: string) {
    const session = await this.findOnePlanSession(id);
    return await this.aiPlanSessionRepo.remove(session);
  }

  // AiPlanItem
  async createPlanItem(dto: CreateAiPlanItemDto) {
    const item = this.aiPlanItemRepo.create(dto);
    return await this.aiPlanItemRepo.save(item);
  }

  async findAllPlanItems() {
    return await this.aiPlanItemRepo.find();
  }

  async updatePlanItem(id: string, dto: UpdateAiPlanItemDto) {
    const item = await this.aiPlanItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('AiPlanItem not found');
    Object.assign(item, dto);
    return await this.aiPlanItemRepo.save(item);
  }

  async removePlanItem(id: string) {
    const item = await this.aiPlanItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('AiPlanItem not found');
    return await this.aiPlanItemRepo.remove(item);
  }

  // AiEstimation
  async createEstimation(dto: CreateAiEstimationDto) {
    const est = this.aiEstimationRepo.create(dto);
    return await this.aiEstimationRepo.save(est);
  }

  async findAllEstimations() {
    return await this.aiEstimationRepo.find();
  }

  async updateEstimation(id: string, dto: UpdateAiEstimationDto) {
    const est = await this.aiEstimationRepo.findOne({ where: { id } });
    if (!est) throw new NotFoundException('AiEstimation not found');
    Object.assign(est, dto);
    return await this.aiEstimationRepo.save(est);
  }

  async removeEstimation(id: string) {
    const est = await this.aiEstimationRepo.findOne({ where: { id } });
    if (!est) throw new NotFoundException('AiEstimation not found');
    return await this.aiEstimationRepo.remove(est);
  }

  // AiTaskInsight
  async createTaskInsight(dto: CreateAiTaskInsightDto) {
    const insight = this.aiTaskInsightRepo.create(dto);
    return await this.aiTaskInsightRepo.save(insight);
  }

  async findAllTaskInsights() {
    return await this.aiTaskInsightRepo.find();
  }

  async updateTaskInsight(id: string, dto: UpdateAiTaskInsightDto) {
    const insight = await this.aiTaskInsightRepo.findOne({ where: { id } });
    if (!insight) throw new NotFoundException('AiTaskInsight not found');
    Object.assign(insight, dto);
    return await this.aiTaskInsightRepo.save(insight);
  }

  async removeTaskInsight(id: string) {
    const insight = await this.aiTaskInsightRepo.findOne({ where: { id } });
    if (!insight) throw new NotFoundException('AiTaskInsight not found');
    return await this.aiTaskInsightRepo.remove(insight);
  }

  // AiConversation
  async createConversation(dto: CreateAiConversationDto) {
    const convo = this.aiConversationRepo.create(dto);
    return await this.aiConversationRepo.save(convo);
  }

  async findAllConversations() {
    return await this.aiConversationRepo.find({ relations: ['messages'] });
  }

  async updateConversation(id: string, dto: UpdateAiConversationDto) {
    const convo = await this.aiConversationRepo.findOne({ where: { id } });
    if (!convo) throw new NotFoundException('AiConversation not found');
    Object.assign(convo, dto);
    return await this.aiConversationRepo.save(convo);
  }

  async removeConversation(id: string) {
    const convo = await this.aiConversationRepo.findOne({ where: { id } });
    if (!convo) throw new NotFoundException('AiConversation not found');
    return await this.aiConversationRepo.remove(convo);
  }

  // AiMessage
  async createMessage(dto: CreateAiMessageDto) {
    const msg = this.aiMessageRepo.create(dto);
    return await this.aiMessageRepo.save(msg);
  }

  async findAllMessages() {
    return await this.aiMessageRepo.find();
  }

  async updateMessage(id: string, dto: UpdateAiMessageDto) {
    const msg = await this.aiMessageRepo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('AiMessage not found');
    Object.assign(msg, dto);
    return await this.aiMessageRepo.save(msg);
  }

  async removeMessage(id: string) {
    const msg = await this.aiMessageRepo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('AiMessage not found');
    return await this.aiMessageRepo.remove(msg);
  }
}
