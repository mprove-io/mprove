import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendIsOrgExistRequestPayload {
  @IsString()
  name: string;
}

export class ToBackendIsOrgExistRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendIsOrgExistRequestPayload)
  payload: ToBackendIsOrgExistRequestPayload;
}

export class ToBackendIsOrgExistResponsePayload {
  @IsBoolean()
  isExist: boolean;
}

export class ToBackendIsOrgExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsOrgExistResponsePayload)
  payload: ToBackendIsOrgExistResponsePayload;
}
