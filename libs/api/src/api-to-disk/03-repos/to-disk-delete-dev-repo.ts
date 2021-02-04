import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskDeleteDevRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;
}

export class ToDiskDeleteDevRepoRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoRequestPayload)
  readonly payload: ToDiskDeleteDevRepoRequestPayload;
}

export class ToDiskDeleteDevRepoResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly deletedRepoId: string;
}

export class ToDiskDeleteDevRepoResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoResponsePayload)
  readonly payload: ToDiskDeleteDevRepoResponsePayload;
}
