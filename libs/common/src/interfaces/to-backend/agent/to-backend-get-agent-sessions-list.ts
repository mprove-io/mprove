import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetAgentSessionsListRequestPayload {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @IsOptional()
  @IsNumber()
  archivedLimit?: number;

  @IsOptional()
  @IsNumber()
  archivedLastCreatedTs?: number;
}

export class ToBackendGetAgentSessionsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionsListRequestPayload)
  payload: ToBackendGetAgentSessionsListRequestPayload;
}

export class ToBackendGetAgentSessionsListResponsePayload {
  sessions: AgentSessionApi[];
  hasMoreArchived?: boolean;
}

export class ToBackendGetAgentSessionsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionsListResponsePayload)
  payload: ToBackendGetAgentSessionsListResponsePayload;
}
