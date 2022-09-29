import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetEvarsRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetEvarsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetEvarsRequestPayload)
  payload: ToBackendGetEvarsRequestPayload;
}

export class ToBackendGetEvarsResponsePayload {
  @ValidateNested()
  @Type(() => common.Evar)
  evars: common.Evar[];
}

export class ToBackendGetEvarsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetEvarsResponsePayload)
  payload: ToBackendGetEvarsResponsePayload;
}
