import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/objects/_index';

export class ToDiskDeleteOrganizationRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskDeleteOrganizationRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskDeleteOrganizationRequestPayload)
  readonly payload: ToDiskDeleteOrganizationRequestPayload;
}

export class ToDiskDeleteOrganizationResponsePayload {
  @IsString()
  readonly deletedOrganizationId: string;
}

export class ToDiskDeleteOrganizationResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskDeleteOrganizationResponsePayload)
  readonly payload: ToDiskDeleteOrganizationResponsePayload;
}
