import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskIsProjectExistRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskIsProjectExistRequest extends interfaces.ToDiskRequest {
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

export class ToDiskIsProjectExistResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsProjectExistResponsePayload)
  readonly payload: ToDiskIsProjectExistResponsePayload;
}
