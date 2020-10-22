import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';

export class ToDiskCreateOrganizationRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskCreateOrganizationRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationRequestPayload)
  readonly payload: ToDiskCreateOrganizationRequestPayload;
}

export class ToDiskCreateOrganizationResponsePayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskCreateOrganizationResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationResponsePayload)
  readonly payload: ToDiskCreateOrganizationResponsePayload;
}
