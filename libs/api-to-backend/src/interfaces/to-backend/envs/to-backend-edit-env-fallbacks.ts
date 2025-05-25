import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditEnvFallbacksRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsBoolean()
  isFallbackToProdConnections: boolean;

  @IsBoolean()
  isFallbackToProdVariables: boolean;
}

export class ToBackendEditEnvFallbacksRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditEnvFallbacksRequestPayload)
  payload: ToBackendEditEnvFallbacksRequestPayload;
}

export class ToBackendEditEnvFallbacksResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Env)
  envs: common.Env[];
}

export class ToBackendEditEnvFallbacksResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditEnvFallbacksResponsePayload)
  payload: ToBackendEditEnvFallbacksResponsePayload;
}
