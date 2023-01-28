import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteRepRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  repId: string;
}

export class ToBackendDeleteRepRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteRepRequestPayload)
  payload: ToBackendDeleteRepRequestPayload;
}

export class ToBackendDeleteRepResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
