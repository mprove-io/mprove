import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskIsOrgExistRequestPayload {
  @IsString()
  orgId: string;
}

export class ToDiskIsOrgExistRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskIsOrgExistRequestPayload)
  payload: ToDiskIsOrgExistRequestPayload;
}

export class ToDiskIsOrgExistResponsePayload {
  @IsString()
  orgId: string;

  @IsBoolean()
  isOrgExist: boolean;
}

export class ToDiskIsOrgExistResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsOrgExistResponsePayload)
  payload: ToDiskIsOrgExistResponsePayload;
}
