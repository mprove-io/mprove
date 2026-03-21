import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetSessionProviderModelsRequestPayload {
  @IsString()
  projectId: string;

  @IsArray()
  @IsEnum(SessionTypeEnum, { each: true })
  sessionTypes: SessionTypeEnum[];

  @IsOptional()
  @IsBoolean()
  forceLoadFromCache?: boolean;
}

export class ToBackendGetSessionProviderModelsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetSessionProviderModelsRequestPayload)
  payload: ToBackendGetSessionProviderModelsRequestPayload;
}

export class ToBackendGetSessionProviderModelsResponsePayload {
  modelsOpencode: AgentModelApi[];
  modelsAi: AgentModelApi[];
}

export class ToBackendGetSessionProviderModelsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetSessionProviderModelsResponsePayload)
  payload: ToBackendGetSessionProviderModelsResponsePayload;
}
