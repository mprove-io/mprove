import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetVizsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;
}

export class ToBackendGetVizsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetVizsRequestPayload)
  payload: ToBackendGetVizsRequestPayload;
}

export class ToBackendGetVizsResponsePayload {
  @ValidateNested()
  @Type(() => common.Viz)
  vizs: common.Viz[];
}

export class ToBackendGetVizsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetVizsResponsePayload)
  payload: ToBackendGetVizsResponsePayload;
}
