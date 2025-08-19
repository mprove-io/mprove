import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendIsOrgExistResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsOrgExistResponsePayload)
  payload: ToBackendIsOrgExistResponsePayload;
}
