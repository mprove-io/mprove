import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateBranchRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  newBranchId: string;

  @IsString()
  fromBranchId: string;

  @IsBoolean()
  isRepoProd: boolean;
}

export class ToBackendCreateBranchRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateBranchRequestPayload)
  payload: ToBackendCreateBranchRequestPayload;
}

export class ToBackendCreateBranchResponse extends MyResponse {
  payload: { [k in any]: never };
}
