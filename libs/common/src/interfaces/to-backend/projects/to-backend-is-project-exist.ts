import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendIsProjectExistRequestPayload {
  @IsString()
  orgId: string;

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

export class ToBackendIsProjectExistResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsProjectExistResponsePayload)
  payload: ToBackendIsProjectExistResponsePayload;
}
