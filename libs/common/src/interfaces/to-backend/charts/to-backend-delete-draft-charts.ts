import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteDraftChartsRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString({ each: true })
  chartIds: string[];
}

export class ToBackendDeleteDraftChartsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteDraftChartsRequestPayload)
  payload: ToBackendDeleteDraftChartsRequestPayload;
}

export class ToBackendDeleteDraftChartsResponse extends MyResponse {
  payload: { [k in any]: never };
}
