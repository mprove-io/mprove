import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskCreateOrganizationRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskCreateOrganizationRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationRequestPayload)
  readonly payload: ToDiskCreateOrganizationRequestPayload;
}

export class ToDiskCreateOrganizationResponsePayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskCreateOrganizationResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationResponsePayload)
  readonly payload: ToDiskCreateOrganizationResponsePayload;
}
