import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendIsOrgExistRequestPayload {
  @IsString()
  readonly name: string;
}

export class ToBackendIsOrgExistRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendIsOrgExistRequestPayload)
  readonly payload: ToBackendIsOrgExistRequestPayload;
}

export class ToBackendIsOrgExistResponsePayload {
  @IsBoolean()
  readonly isExist: boolean;
}

export class ToBackendIsOrgExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsOrgExistResponsePayload)
  readonly payload: ToBackendIsOrgExistResponsePayload;
}
