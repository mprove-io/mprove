import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~api/objects/_index';

export class ToBackendDeleteRecordsRequestPayload {
  @IsOptional()
  @IsString({ each: true })
  readonly emails?: string[];

  @IsOptional()
  @IsString({ each: true })
  readonly organizationIds?: string[];
}

export class ToBackendDeleteRecordsRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBackendRequestInfo)
  readonly info: apiObjects.ToBackendRequestInfo;

  @ValidateNested()
  @Type(() => ToBackendDeleteRecordsRequestPayload)
  readonly payload: ToBackendDeleteRecordsRequestPayload;
}

export class ToBackendDeleteRecordsResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  readonly payload: { [K in any]: never };
}
