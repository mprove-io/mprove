import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { IsTimezone } from '#common/functions/is-timezone';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetChartRequestPayload {
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

  @IsTimezone()
  timezone: string;
}

export class ToBackendGetChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetChartRequestPayload)
  payload: ToBackendGetChartRequestPayload;
}

export class ToBackendGetChartResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ChartX)
  chart: ChartX;
}

export class ToBackendGetChartResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetChartResponsePayload)
  payload: ToBackendGetChartResponsePayload;
}
