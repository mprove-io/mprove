import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateSessionEditorRequestPayload {
  @IsString()
  projectId: string;

  @IsEnum(SandboxTypeEnum)
  sandboxType: SandboxTypeEnum;

  @IsString()
  provider: string;

  @IsString()
  model: string;

  @IsString()
  agent: string;

  @IsString()
  variant: string;

  @IsString()
  envId: string;

  @IsString()
  initialBranch: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsString()
  messageId: string;

  @IsString()
  partId: string;
}

export class ToBackendCreateSessionEditorRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateSessionEditorRequestPayload)
  payload: ToBackendCreateSessionEditorRequestPayload;
}

export class ToBackendCreateSessionEditorResponsePayload {
  @IsString()
  sessionId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendCreateSessionEditorResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateSessionEditorResponsePayload)
  payload: ToBackendCreateSessionEditorResponsePayload;
}
