export interface AttachmentResponseDto {
  id: string;
  taskId?: string | null;
  projectId?: string | null;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  createdAt: string;
}
