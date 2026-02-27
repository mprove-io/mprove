import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSaveCreateChartRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fromChartId: string;

  @IsString()
  newChartId: string;

  @IsString()
  tileTitle: string;

  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;
}

export class ToBackendSaveCreateChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateChartRequestPayload)
  payload: ToBackendSaveCreateChartRequestPayload;
}

export class ToBackendSaveCreateChartResponsePayload {
  @ValidateNested()
  @Type(() => ChartX)
  chart: ChartX;
}

export class ToBackendSaveCreateChartResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateChartResponsePayload)
  payload: ToBackendSaveCreateChartResponsePayload;
}
