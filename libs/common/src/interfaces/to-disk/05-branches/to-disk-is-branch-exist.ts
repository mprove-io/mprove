import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskIsBranchExistRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => BaseProject)
  baseProject: BaseProject;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsBoolean()
  isRemote: boolean;
}

export class ToDiskIsBranchExistRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskIsBranchExistRequestPayload)
  payload: ToDiskIsBranchExistRequestPayload;
}

export class ToDiskIsBranchExistResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsBoolean()
  isRemote: boolean;

  @IsBoolean()
  isBranchExist: boolean;
}

export class ToDiskIsBranchExistResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsBranchExistResponsePayload)
  payload: ToDiskIsBranchExistResponsePayload;
}
