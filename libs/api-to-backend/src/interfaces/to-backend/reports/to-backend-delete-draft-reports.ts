import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteDraftReportsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString({ each: true })
  reportIds: string[];
}

export class ToBackendDeleteDraftReportsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteDraftReportsRequestPayload)
  payload: ToBackendDeleteDraftReportsRequestPayload;
}

export class ToBackendDeleteDraftReportsResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
