import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteDraftRepsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString({ each: true })
  repIds: string[];
}

export class ToBackendDeleteDraftRepsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteDraftRepsRequestPayload)
  payload: ToBackendDeleteDraftRepsRequestPayload;
}

export class ToBackendDeleteDraftRepsResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
