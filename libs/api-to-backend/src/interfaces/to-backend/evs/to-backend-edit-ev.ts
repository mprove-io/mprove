import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditEvRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;

  @IsString()
  value: string;
}

export class ToBackendEditEvRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditEvRequestPayload)
  payload: ToBackendEditEvRequestPayload;
}

export class ToBackendEditEvResponsePayload {
  @ValidateNested()
  @Type(() => common.Ev)
  ev: common.Ev;
}

export class ToBackendEditEvResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditEvResponsePayload)
  payload: ToBackendEditEvResponsePayload;
}
