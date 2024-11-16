import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteChartRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  chartId: string;
}

export class ToBackendDeleteChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteChartRequestPayload)
  payload: ToBackendDeleteChartRequestPayload;
}

export class ToBackendDeleteChartResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
