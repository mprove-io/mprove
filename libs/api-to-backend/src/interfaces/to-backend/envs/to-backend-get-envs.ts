import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetEnvsRequestPayload {
  @IsString()
  projectId: string;

  @IsInt()
  pageNum: number;

  @IsInt()
  perPage: number;
}

export class ToBackendGetEnvsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsRequestPayload)
  payload: ToBackendGetEnvsRequestPayload;
}

export class ToBackendGetEnvsResponsePayload {
  @ValidateNested()
  @Type(() => common.Env)
  envs: common.Env[];

  @IsInt()
  total: number;
}

export class ToBackendGetEnvsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsResponsePayload)
  payload: ToBackendGetEnvsResponsePayload;
}
