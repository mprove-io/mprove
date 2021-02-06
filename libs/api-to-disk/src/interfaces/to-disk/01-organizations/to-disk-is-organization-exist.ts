import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskIsOrganizationExistRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskIsOrganizationExistRequest extends ToDiskRequest {
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

export class ToDiskIsOrganizationExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsOrganizationExistResponsePayload)
  readonly payload: ToDiskIsOrganizationExistResponsePayload;
}
