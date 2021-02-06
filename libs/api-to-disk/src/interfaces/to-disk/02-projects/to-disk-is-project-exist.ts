import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskIsProjectExistRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskIsProjectExistRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskIsProjectExistRequestPayload)
  readonly payload: ToDiskIsProjectExistRequestPayload;
}

export class ToDiskIsProjectExistResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsBoolean()
  readonly isProjectExist: boolean;
}

export class ToDiskIsProjectExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsProjectExistResponsePayload)
  readonly payload: ToDiskIsProjectExistResponsePayload;
}
