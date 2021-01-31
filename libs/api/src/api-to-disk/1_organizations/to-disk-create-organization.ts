import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~api/objects/_index';

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
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateOrganizationResponsePayload)
  readonly payload: ToDiskCreateOrganizationResponsePayload;
}
