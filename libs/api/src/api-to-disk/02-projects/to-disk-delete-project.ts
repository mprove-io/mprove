import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskDeleteProjectRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskDeleteProjectRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectRequestPayload)
  readonly payload: ToDiskDeleteProjectRequestPayload;
}

export class ToDiskDeleteProjectResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly deletedProjectId: string;
}

export class ToDiskDeleteProjectResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectResponsePayload)
  readonly payload: ToDiskDeleteProjectResponsePayload;
}
