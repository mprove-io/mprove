import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '../to-backend-request';

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

  @IsEnum(common.ProjectWeekStartEnum)
  readonly weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  readonly connections: common.ProjectConnection[];
}

export class ToBackendRebuildStructSpecialRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRebuildStructSpecialRequestPayload)
  readonly payload: ToBackendRebuildStructSpecialRequestPayload;
}
