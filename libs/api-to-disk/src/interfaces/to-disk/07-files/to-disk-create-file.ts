import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateFileRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  fileName: string;

  @IsString()
  userAlias: string;
}

export class ToDiskCreateFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateFileRequestPayload)
  payload: ToDiskCreateFileRequestPayload;
}

export class ToDiskCreateFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskCreateFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateFileResponsePayload)
  payload: ToDiskCreateFileResponsePayload;
}
