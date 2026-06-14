import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities';
import { CreateNotificationDto, UpdateNotificationDto } from '@orchest/shared';
import { SseService } from './sse.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly sseService: SseService,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createDto);
    return this.notificationRepository.save(notification);
  }

  /**
   * Persists the notification to the DB first, then delivers it over SSE.
   * DB failure is re-thrown (no SSE attempt). SSE failure is logged without rollback.
   * Requirements: 8.1, 8.2
   */
  async createAndDeliver(dto: CreateNotificationDto): Promise<Notification> {
    let saved: Notification;
    try {
      saved = await this.notificationRepository.save(
        this.notificationRepository.create(dto),
      );
    } catch (err) {
      this.logger.error('Failed to persist notification', { dto, err });
      throw err; // propagate — no SSE attempt
    }
    try {
      this.sseService.push(saved.userId, saved);
    } catch (sseErr) {
      this.logger.warn('SSE push failed', { notificationId: saved.id, sseErr });
    }
    return saved;
  }

  async findAll(userId: string, page: number, limit: number) {
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async update(id: string, updateDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async updateOwned(id: string, userId: string, dto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');
    Object.assign(notification, dto);
    return this.notificationRepository.save(notification);
  }

  async removeOwned(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');
    await this.notificationRepository.remove(notification);
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { count: result.affected ?? 0 };
  }
}
