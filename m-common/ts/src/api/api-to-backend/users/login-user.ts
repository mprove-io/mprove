import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Response, ToBackendRequest } from '~/api/objects/_index';

export class ToBackendLoginUserRequestPayload {
  @IsString()
  readonly token: string;
}

export class ToBackendLoginUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendLoginUserRequestPayload)
  readonly payload: ToBackendLoginUserRequestPayload;
}

export class ToBackendLoginUserResponse extends Response {
  readonly payload: { [K in any]: never };
}
