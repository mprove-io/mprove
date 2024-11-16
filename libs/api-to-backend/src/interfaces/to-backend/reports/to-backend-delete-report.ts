import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteReportRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  repId: string;
}

export class ToBackendDeleteReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteReportRequestPayload)
  payload: ToBackendDeleteReportRequestPayload;
}

export class ToBackendDeleteReportResponse extends common.MyResponse {
  payload: { [k in any]: never };
}
