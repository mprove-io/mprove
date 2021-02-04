import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskIsOrganizationExistRequestPayload {
  @IsString()
  readonly organizationId: string;
}

export class ToDiskIsOrganizationExistRequest extends interfaces.ToDiskRequest {
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

export class ToDiskIsOrganizationExistResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsOrganizationExistResponsePayload)
  readonly payload: ToDiskIsOrganizationExistResponsePayload;
}
