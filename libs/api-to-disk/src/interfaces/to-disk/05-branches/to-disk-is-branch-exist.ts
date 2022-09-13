import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskIsBranchExistRequestPayload {
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

  @IsEnum(common.ProjectRemoteTypeEnum)
  remoteType: common.ProjectRemoteTypeEnum;

  @IsString()
  @IsOptional()
  gitUrl?: string;

  @IsString()
  @IsOptional()
  privateKey?: string;

  @IsString()
  @IsOptional()
  publicKey?: string;
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

export class ToDiskIsBranchExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskIsBranchExistResponsePayload)
  payload: ToDiskIsBranchExistResponsePayload;
}
