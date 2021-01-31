import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/objects/_index';

export class ToDiskIsOrganizationExistRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskIsOrganizationExistRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskIsOrganizationExistRequestPayload)
  readonly payload: ToDiskIsOrganizationExistRequestPayload;
}

export class ToDiskIsOrganizationExistResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsBoolean()
  readonly isOrganizationExist: boolean;
}

export class ToDiskIsOrganizationExistResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskIsOrganizationExistResponsePayload)
  readonly payload: ToDiskIsOrganizationExistResponsePayload;
}
