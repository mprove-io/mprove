import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskIsBranchExistRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsBoolean()
  readonly isRemote: boolean;
}

export class ToDiskIsBranchExistRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskIsBranchExistRequestPayload)
  readonly payload: ToDiskIsBranchExistRequestPayload;
}

export class ToDiskIsBranchExistResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsBoolean()
  readonly isRemote: boolean;

  @IsBoolean()
  readonly isBranchExist: boolean;
}

export class ToDiskIsBranchExistResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsBranchExistResponsePayload)
  readonly payload: ToDiskIsBranchExistResponsePayload;
}
