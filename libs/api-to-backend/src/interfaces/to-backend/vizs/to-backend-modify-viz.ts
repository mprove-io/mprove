import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendModifyVizRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  vizId: string;

  @IsString()
  vizFileText: string;
}

export class ToBackendModifyVizRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendModifyVizRequestPayload)
  payload: ToBackendModifyVizRequestPayload;
}

export class ToBackendModifyVizResponsePayload {
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

export class ToBackendModifyVizResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendModifyVizResponsePayload)
  payload: ToBackendModifyVizResponsePayload;
}
