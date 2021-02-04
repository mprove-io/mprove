import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskDeleteOrganizationRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskDeleteOrganizationRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrganizationRequestPayload)
  readonly payload: ToDiskDeleteOrganizationRequestPayload;
}

export class ToDiskDeleteOrganizationResponsePayload {
  @IsString()
  readonly deletedOrganizationId: string;
}

export class ToDiskDeleteOrganizationResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrganizationResponsePayload)
  readonly payload: ToDiskDeleteOrganizationResponsePayload;
}
