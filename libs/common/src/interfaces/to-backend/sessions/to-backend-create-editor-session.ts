import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateEditorSessionRequestPayload {
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

  @IsBoolean()
  useCodex: boolean;
}

export class ToBackendCreateEditorSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEditorSessionRequestPayload)
  payload: ToBackendCreateEditorSessionRequestPayload;
}

export class ToBackendCreateEditorSessionResponsePayload {
  @IsString()
  sessionId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendCreateEditorSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEditorSessionResponsePayload)
  payload: ToBackendCreateEditorSessionResponsePayload;
}
