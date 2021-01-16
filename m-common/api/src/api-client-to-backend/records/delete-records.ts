import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';

export class ToBackendDeleteRecordsRequestPayload {
  @IsString({ each: true })
  readonly userIds: string[];
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

  readonly payload: {
    [K in any]: never;
  };
}
