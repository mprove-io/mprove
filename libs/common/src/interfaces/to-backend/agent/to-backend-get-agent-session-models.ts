import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetAgentSessionModelsRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendGetAgentSessionModelsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionModelsRequestPayload)
  payload: ToBackendGetAgentSessionModelsRequestPayload;
}

export class ToBackendGetAgentSessionModelsResponsePayload {
  models: AgentModelApi[];
}

export class ToBackendGetAgentSessionModelsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionModelsResponsePayload)
  payload: ToBackendGetAgentSessionModelsResponsePayload;
}
