import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteVizRequestPayload {
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
}

export class ToBackendDeleteVizRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteVizRequestPayload)
  payload: ToBackendDeleteVizRequestPayload;
}

export class ToBackendDeleteVizResponse extends common.MyResponse {
  payload: { [k in any]: never };
}