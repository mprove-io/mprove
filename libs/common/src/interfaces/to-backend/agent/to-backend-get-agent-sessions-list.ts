import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetAgentSessionsListRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetAgentSessionsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionsListRequestPayload)
  payload: ToBackendGetAgentSessionsListRequestPayload;
}

export class ToBackendGetAgentSessionsListResponsePayload {
  sessions: AgentSessionApi[];
}

export class ToBackendGetAgentSessionsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionsListResponsePayload)
  payload: ToBackendGetAgentSessionsListResponsePayload;
}
