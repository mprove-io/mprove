import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToBackendConfirmUserEmailRequestPayload {
  @IsString()
  readonly token: string;
}

export class ToBackendConfirmUserEmailRequest extends interfaces.ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendConfirmUserEmailRequestPayload)
  readonly payload: ToBackendConfirmUserEmailRequestPayload;
}

export class ToBackendConfirmUserEmailResponse extends interfaces.MyResponse {
  readonly payload: { [K in any]: never };
}
