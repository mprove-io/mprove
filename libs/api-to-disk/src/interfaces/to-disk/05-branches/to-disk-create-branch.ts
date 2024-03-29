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

export class ToDiskCreateBranchRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  newBranch: string;

  @IsString()
  fromBranch: string;

  @IsBoolean()
  isFromRemote: boolean;

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

export class ToDiskCreateBranchRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchRequestPayload)
  payload: ToDiskCreateBranchRequestPayload;
}

export class ToDiskCreateBranchResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskCreateBranchResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchResponsePayload)
  payload: ToDiskCreateBranchResponsePayload;
}
