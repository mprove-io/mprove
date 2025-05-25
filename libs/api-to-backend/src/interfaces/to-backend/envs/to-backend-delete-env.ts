import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteEnvRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendDeleteEnvRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvRequestPayload)
  payload: ToBackendDeleteEnvRequestPayload;
}

export class ToBackendDeleteEnvResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Env)
  envs: common.Env[];
}

export class ToBackendDeleteEnvResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvResponsePayload)
  payload: ToBackendDeleteEnvResponsePayload;
}
