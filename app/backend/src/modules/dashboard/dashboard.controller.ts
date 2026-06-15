import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /api/v1/dashboard/stats
   * Returns aggregated workspace statistics for the authenticated user.
   */
  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getStats(user.id);
  }
}
