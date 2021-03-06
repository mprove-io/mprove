import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskGetFileRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  fileNodeId: string;
}

export class ToDiskGetFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetFileRequestPayload)
  payload: ToDiskGetFileRequestPayload;
}

export class ToDiskGetFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @IsString()
  content: string;
}

export class ToDiskGetFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetFileResponsePayload)
  payload: ToDiskGetFileResponsePayload;
}
