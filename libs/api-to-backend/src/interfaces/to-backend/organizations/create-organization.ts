import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Organization } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateOrganizationRequestPayload {
  @IsString()
  readonly name: string;
}

export class ToBackendCreateOrganizationRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateOrganizationRequestPayload)
  readonly payload: ToBackendCreateOrganizationRequestPayload;
}

export class ToBackendCreateOrganizationResponsePayload {
  @IsString()
  readonly organization: Organization;
}

export class ToBackendCreateOrganizationResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateOrganizationResponsePayload)
  readonly payload: ToBackendCreateOrganizationResponsePayload;
}
