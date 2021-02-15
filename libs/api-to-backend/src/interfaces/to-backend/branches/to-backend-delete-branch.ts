import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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

export class ToBackendDeleteBranchResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
