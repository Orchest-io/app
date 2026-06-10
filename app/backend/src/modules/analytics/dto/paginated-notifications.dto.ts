import { Notification } from '../entities/notification.entity';

export class PaginatedNotificationsDto {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}
