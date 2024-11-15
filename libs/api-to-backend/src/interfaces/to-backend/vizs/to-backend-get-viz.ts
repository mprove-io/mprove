import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetVizRequestPayload {
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

export class ToBackendGetVizRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetVizRequestPayload)
  payload: ToBackendGetVizRequestPayload;
}

export class ToBackendGetVizResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.VizX)
  viz: common.VizX;
}

export class ToBackendGetVizResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetVizResponsePayload)
  payload: ToBackendGetVizResponsePayload;
}
