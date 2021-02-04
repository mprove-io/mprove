import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskMoveCatalogNodeRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fromNodeId: string;

  @IsString()
  readonly toNodeId: string;
}

export class ToDiskMoveCatalogNodeRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeRequestPayload)
  readonly payload: ToDiskMoveCatalogNodeRequestPayload;
}

export class ToDiskMoveCatalogNodeResponsePayload {
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
  @Type(() => interfaces.DiskCatalogNode)
  readonly nodes: Array<interfaces.DiskCatalogNode>;
}

export class ToDiskMoveCatalogNodeResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeResponsePayload)
  readonly payload: ToDiskMoveCatalogNodeResponsePayload;
}
