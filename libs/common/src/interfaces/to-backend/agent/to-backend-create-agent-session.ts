import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { OcSessionApi } from '#common/interfaces/backend/oc-session-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateAgentSessionRequestPayload {
  @IsString()
  projectId: string;

  @IsEnum(SessionTypeEnum)
  sessionType: SessionTypeEnum;

  @IsOptional()
  @IsEnum(SandboxTypeEnum)
  sandboxType?: SandboxTypeEnum;

  @IsString()
  provider: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  agent?: string;

  @IsString()
  variant: string;

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

  @IsOptional()
  session?: SessionApi;

  @IsOptional()
  ocSession?: OcSessionApi;

  @IsOptional()
  events?: AgentEventApi[];

  @IsOptional()
  messages?: AgentMessageApi[];

  @IsOptional()
  parts?: AgentPartApi[];

  @IsOptional()
  sessions?: SessionApi[];

  @IsOptional()
  hasMoreArchived?: boolean;
}

export class ToBackendCreateAgentSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentSessionResponsePayload)
  payload: ToBackendCreateAgentSessionResponsePayload;
}
