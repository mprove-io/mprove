import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskGetCatalogFilesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskGetCatalogFilesRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesRequestPayload)
  readonly payload: ToDiskGetCatalogFilesRequestPayload;
}

export class ToDiskGetCatalogFilesResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  readonly repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => interfaces.DiskFileLine)
  readonly conflicts: interfaces.DiskFileLine[];

  @ValidateNested()
  @Type(() => interfaces.DiskCatalogFile)
  readonly files: interfaces.DiskCatalogFile[];
}

export class ToDiskGetCatalogFilesResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesResponsePayload)
  readonly payload: ToDiskGetCatalogFilesResponsePayload;
}
