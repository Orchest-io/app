import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiPlanSession } from './entities/ai-plan-session.entity';
import { AiEstimation } from './entities/ai-estimation.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiMessage } from './entities/ai-message.entity';

import {
  CreateAiPlanSessionDto, UpdateAiPlanSessionDto,
  CreateAiEstimationDto, UpdateAiEstimationDto,
  CreateAiConversationDto, UpdateAiConversationDto,
  CreateAiMessageDto, UpdateAiMessageDto
} from '@orchest/shared';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiPlanSession) private aiPlanSessionRepo: Repository<AiPlanSession>,
    @InjectRepository(AiEstimation) private aiEstimationRepo: Repository<AiEstimation>,
    @InjectRepository(AiConversation) private aiConversationRepo: Repository<AiConversation>,
    @InjectRepository(AiMessage) private aiMessageRepo: Repository<AiMessage>,
  ) {}

  // AiPlanSession
  async createPlanSession(dto: CreateAiPlanSessionDto) {
    const session = this.aiPlanSessionRepo.create(dto as any) as any;
    return await this.aiPlanSessionRepo.save(session);
  }

  async findAllPlanSessions() {
    return await this.aiPlanSessionRepo.find();
  }

  async findOnePlanSession(id: string) {
    const session = await this.aiPlanSessionRepo.findOne({ where: { id } });
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

  // AiEstimation
  async createEstimation(dto: CreateAiEstimationDto) {
    const est = this.aiEstimationRepo.create(dto as any) as any;
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

  // AiConversation
  async createConversation(dto: CreateAiConversationDto) {
    const convo = this.aiConversationRepo.create(dto as any) as any;
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
    const msg = this.aiMessageRepo.create(dto as any) as any;
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
