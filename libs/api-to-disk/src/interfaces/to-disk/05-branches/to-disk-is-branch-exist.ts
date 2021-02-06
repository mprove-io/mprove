import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

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

export class ToDiskIsBranchExistRequest extends ToDiskRequest {
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

export class ToDiskIsBranchExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsBranchExistResponsePayload)
  readonly payload: ToDiskIsBranchExistResponsePayload;
}
