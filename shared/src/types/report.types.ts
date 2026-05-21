import { ReportType, ReportStatus, ReportFormat } from '../enums';

export interface TimeEntry {
  id: string;
  taskId?: string;
  userId: string;
  projectId: string;
  description?: string;
  durationMinutes: number;
  hourlyRate?: number;
  entryDate: Date;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
}

export interface Report {
  id: string;
  projectId?: string;
  generatedBy: string;
  title: string;
  description?: string;
  type?: ReportType;
  status?: ReportStatus;
  format?: ReportFormat;
  fileUrl?: string;
  filters?: any;
  generatedAt?: Date;
  createdAt: Date;
}

export interface ReportSnapshot {
  id: string;
  reportId: string;
  metricName: string;
  metricValue?: number;
  metricUnit?: string;
  chartData?: any;
  capturedAt: Date;
}
