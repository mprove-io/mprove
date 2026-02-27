import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteChartRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

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

export class ToBackendDeleteChartResponse extends MyResponse {
  payload: { [k in any]: never };
}
