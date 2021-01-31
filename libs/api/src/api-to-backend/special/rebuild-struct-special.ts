import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import * as apiObjects from '~api/objects/_index';

export class ToBackendRebuildStructSpecialRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly structId: string;

  @IsEnum(apiEnums.ProjectWeekStartEnum)
  readonly weekStart: apiEnums.ProjectWeekStartEnum;

  // @ValidateNested()
  // @Type(() => apiObjects.File)
  // readonly files: apiObjects.File[];

  @ValidateNested()
  @Type(() => apiObjects.ProjectConnection)
  readonly connections: apiObjects.ProjectConnection[];
}

export class ToBackendRebuildStructSpecialRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBackendRequestInfo)
  readonly info: apiObjects.ToBackendRequestInfo;

  @ValidateNested()
  @Type(() => ToBackendRebuildStructSpecialRequestPayload)
  readonly payload: ToBackendRebuildStructSpecialRequestPayload;
}
