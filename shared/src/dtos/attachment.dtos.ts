import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateAttachmentDto {
  @IsUUID()
  uploadedBy: string;

  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  fileSizeBytes?: number;
}
