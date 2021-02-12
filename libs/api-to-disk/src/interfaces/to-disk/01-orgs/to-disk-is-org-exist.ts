import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskIsOrgExistRequestPayload {
  @IsString()
  readonly orgId: string;
}

export class ToDiskIsOrgExistRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskIsOrgExistRequestPayload)
  readonly payload: ToDiskIsOrgExistRequestPayload;
}

export class ToDiskIsOrgExistResponsePayload {
  @IsString()
  readonly orgId: string;

  @IsBoolean()
  readonly isOrgExist: boolean;
}

export class ToDiskIsOrgExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsOrgExistResponsePayload)
  readonly payload: ToDiskIsOrgExistResponsePayload;
}
