import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  reportId: string;
}

export class ToBackendDeleteReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteReportRequestPayload)
  payload: ToBackendDeleteReportRequestPayload;
}

export class ToBackendDeleteReportResponse extends MyResponse {
  payload: { [k in any]: never };
}
