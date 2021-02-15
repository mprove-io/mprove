import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateBranchRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  newBranchId: string;

  @IsString()
  fromBranchId: string;
}

export class ToBackendCreateBranchRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateBranchRequestPayload)
  payload: ToBackendCreateBranchRequestPayload;
}

export class ToBackendCreateBranchResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
