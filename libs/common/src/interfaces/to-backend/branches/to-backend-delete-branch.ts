import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteBranchRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendDeleteBranchRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteBranchRequestPayload)
  payload: ToBackendDeleteBranchRequestPayload;
}

export class ToBackendDeleteBranchResponse extends MyResponse {
  payload: { [k in any]: never };
}
