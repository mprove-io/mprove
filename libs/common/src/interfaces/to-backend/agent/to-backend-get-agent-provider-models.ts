import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetAgentProviderModelsRequestPayload {
  @IsString()
  provider: string;
}

export class ToBackendGetAgentProviderModelsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAgentProviderModelsRequestPayload)
  payload: ToBackendGetAgentProviderModelsRequestPayload;
}

export class ToBackendGetAgentProviderModelsResponsePayload {
  models: AgentModelApi[];
}

export class ToBackendGetAgentProviderModelsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentProviderModelsResponsePayload)
  payload: ToBackendGetAgentProviderModelsResponsePayload;
}
