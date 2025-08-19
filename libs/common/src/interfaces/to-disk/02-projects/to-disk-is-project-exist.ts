import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

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

export class ToDiskIsProjectExistResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsProjectExistResponsePayload)
  payload: ToDiskIsProjectExistResponsePayload;
}
