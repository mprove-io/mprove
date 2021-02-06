import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteRecordsRequestPayload {
  @IsOptional()
  @IsString({ each: true })
  readonly emails?: string[];

  @IsOptional()
  @IsString({ each: true })
  readonly organizationIds?: string[];
}

export class ToBackendDeleteRecordsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteRecordsRequestPayload)
  readonly payload: ToBackendDeleteRecordsRequestPayload;
}

export class ToBackendDeleteRecordsResponse extends common.MyResponse {
  readonly payload: { [K in any]: never };
}
