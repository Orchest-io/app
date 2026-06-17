import {
  IsUUID,
  IsString,
  MinLength,
  MaxLength,
  IsIn,
  IsOptional,
} from 'class-validator';

export class GenerateTaskRequestDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description: string;

  @IsIn(['frontend-only', 'backend-only', 'full-stack'])
  scope: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hints?: string;
}
