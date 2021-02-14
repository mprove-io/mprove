import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Connection } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;
}

export class ToBackendDeleteConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteConnectionRequestPayload)
  payload: ToBackendDeleteConnectionRequestPayload;
}

export class ToBackendDeleteConnectionResponsePayload {
  @ValidateNested()
  @Type(() => Connection)
  projectConnections: Connection[];
}

export class ToBackendDeleteConnectionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteConnectionResponsePayload)
  payload: ToBackendDeleteConnectionResponsePayload;
}
