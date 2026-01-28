import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendDeleteDraftReportsResponse extends MyResponse {
  payload: { [k in any]: never };
}
