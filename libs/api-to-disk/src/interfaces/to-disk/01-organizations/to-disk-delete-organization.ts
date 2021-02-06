import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteOrganizationRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskDeleteOrganizationRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrganizationRequestPayload)
  readonly payload: ToDiskDeleteOrganizationRequestPayload;
}

export class ToDiskDeleteOrganizationResponsePayload {
  @IsString()
  readonly deletedOrganizationId: string;
}

export class ToDiskDeleteOrganizationResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrganizationResponsePayload)
  readonly payload: ToDiskDeleteOrganizationResponsePayload;
}
