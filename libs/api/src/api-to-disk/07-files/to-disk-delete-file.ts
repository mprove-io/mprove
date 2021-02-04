import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskDeleteFileRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fileNodeId: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskDeleteFileRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileRequestPayload)
  readonly payload: ToDiskDeleteFileRequestPayload;
}

export class ToDiskDeleteFileResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsString()
  readonly deletedFileNodeId: string;

  @IsEnum(enums.RepoStatusEnum)
  readonly repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => interfaces.DiskFileLine)
  readonly conflicts: interfaces.DiskFileLine[];

  @ValidateNested()
  @Type(() => interfaces.DiskCatalogNode)
  readonly nodes: Array<interfaces.DiskCatalogNode>;
}

export class ToDiskDeleteFileResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileResponsePayload)
  readonly payload: ToDiskDeleteFileResponsePayload;
}
