import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateEvRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;

  @IsString()
  val: string;
}

export class ToBackendCreateEvRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEvRequestPayload)
  payload: ToBackendCreateEvRequestPayload;
}

export class ToBackendCreateEvResponsePayload {
  @ValidateNested()
  @Type(() => common.Ev)
  ev: common.Ev;
}

export class ToBackendCreateEvResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEvResponsePayload)
  payload: ToBackendCreateEvResponsePayload;
}
