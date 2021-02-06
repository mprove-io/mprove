import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateOrganizationRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskCreateOrganizationRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationRequestPayload)
  readonly payload: ToDiskCreateOrganizationRequestPayload;
}

export class ToDiskCreateOrganizationResponsePayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskCreateOrganizationResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationResponsePayload)
  readonly payload: ToDiskCreateOrganizationResponsePayload;
}
