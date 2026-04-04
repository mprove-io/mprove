import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCloneTestRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  testId: string;
}

export class ToBackendCloneTestRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCloneTestRepoRequestPayload)
  payload: ToBackendCloneTestRepoRequestPayload;
}

export class ToBackendCloneTestRepoResponse extends MyResponse {
  payload: { [k in any]: never };
}
