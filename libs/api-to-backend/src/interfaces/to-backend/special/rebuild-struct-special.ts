import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRebuildStructSpecialRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  structId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  connections: common.ProjectConnection[];
}

export class ToBackendRebuildStructSpecialRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRebuildStructSpecialRequestPayload)
  payload: ToBackendRebuildStructSpecialRequestPayload;
}
