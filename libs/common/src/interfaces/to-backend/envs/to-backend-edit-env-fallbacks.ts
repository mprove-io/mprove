import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Env } from '~common/interfaces/backend/env';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendEditEnvFallbacksResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditEnvFallbacksResponsePayload)
  payload: ToBackendEditEnvFallbacksResponsePayload;
}
