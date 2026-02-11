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
  agent: string;

  @IsString()
  model: string;

  @IsString()
  agentMode: string;

  @IsString()
  permissionMode: string;

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
  sseTicket: string;
}

export class ToBackendCreateAgentSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentSessionResponsePayload)
  payload: ToBackendCreateAgentSessionResponsePayload;
}
