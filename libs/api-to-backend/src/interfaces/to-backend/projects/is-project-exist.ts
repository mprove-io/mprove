import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendIsProjectExistRequestPayload {
  @IsString()
  name: string;
}

export class ToBackendIsProjectExistRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendIsProjectExistRequestPayload)
  payload: ToBackendIsProjectExistRequestPayload;
}

export class ToBackendIsProjectExistResponsePayload {
  @IsBoolean()
  isExist: boolean;
}

export class ToBackendIsProjectExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsProjectExistResponsePayload)
  payload: ToBackendIsProjectExistResponsePayload;
}
