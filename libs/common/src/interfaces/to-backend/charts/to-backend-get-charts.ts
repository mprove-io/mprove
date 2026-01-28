import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { Member } from '#common/interfaces/backend/member';
import { ModelX } from '#common/interfaces/backend/model-x';
import { StructX } from '#common/interfaces/backend/struct-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetChartsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetChartsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetChartsRequestPayload)
  payload: ToBackendGetChartsRequestPayload;
}

export class ToBackendGetChartsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ModelX)
  models: ModelX[];

  @ValidateNested()
  @Type(() => ChartX)
  charts: ChartX[];
}

export class ToBackendGetChartsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetChartsResponsePayload)
  payload: ToBackendGetChartsResponsePayload;
}
