import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskIsProjectExistRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;
}

export class ToDiskIsProjectExistRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskIsProjectExistRequestPayload)
  payload: ToDiskIsProjectExistRequestPayload;
}

export class ToDiskIsProjectExistResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsBoolean()
  isProjectExist: boolean;
}

export class ToDiskIsProjectExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsProjectExistResponsePayload)
  payload: ToDiskIsProjectExistResponsePayload;
}
