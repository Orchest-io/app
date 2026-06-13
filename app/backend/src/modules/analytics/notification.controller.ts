import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Sse,
  Res,
  Query,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Response } from 'express';
import { NotificationService } from './notification.service';
import { SseService, MessageEvent } from './sse.service';
import { CreateNotificationDto, UpdateNotificationDto } from '@orchest/shared';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseService: SseService,
  ) {}

  @Post()
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationService.create(createDto);
  }

  // SSE stream — declared before :id routes to avoid route conflicts
  @Sse('stream')
  stream(@CurrentUser() user: JwtPayload, @Res() res: Response): Observable<MessageEvent> {
    const destroy$ = new Subject<void>();

    res.on('close', () => {
      destroy$.next();
      destroy$.complete();
    });

    return this.sseService.register(user.id).pipe(takeUntil(destroy$));
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.notificationService.findAll(user.id, query.page, query.limit);
  }

  // mark-all-read must come before :id routes to avoid being matched as an id param
  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllRead(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.updateOwned(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationService.removeOwned(id, user.id);
  }
}
