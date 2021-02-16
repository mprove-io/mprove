import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateVizRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  vizFileText: string;
}

export class ToBackendCreateVizRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateVizRequestPayload)
  payload: ToBackendCreateVizRequestPayload;
}

export class ToBackendCreateVizResponsePayload {
  @ValidateNested()
  @Type(() => common.Viz)
  viz: common.Viz;

  @ValidateNested()
  @Type(() => common.Mconfig)
  vizMconfig: common.Mconfig;

  @ValidateNested()
  @Type(() => common.Query)
  vizQuery: common.Query;
}

export class ToBackendCreateVizResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateVizResponsePayload)
  payload: ToBackendCreateVizResponsePayload;
}
