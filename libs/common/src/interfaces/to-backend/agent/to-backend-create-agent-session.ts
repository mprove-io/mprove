import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateAgentSessionRequestPayload {
  @IsString()
  projectId: string;

  @IsEnum(SandboxTypeEnum)
  sandboxType: SandboxTypeEnum;

  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsString()
  agent: string;

  @IsString()
  permissionMode: string;

  @IsOptional()
  @IsString()
  variant?: string;

  @IsString()
  envId: string;

  @IsString()
  initialBranch: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;
}

export class ToBackendCreateAgentSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentSessionRequestPayload)
  payload: ToBackendCreateAgentSessionRequestPayload;
}

export class ToBackendCreateAgentSessionResponsePayload {
  @IsString()
  sessionId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendCreateAgentSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentSessionResponsePayload)
  payload: ToBackendCreateAgentSessionResponsePayload;
}
