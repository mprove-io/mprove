import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetProjectWeekStartRequestPayload {
  @IsString()
  projectId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;
}

export class ToBackendSetProjectWeekStartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectWeekStartRequestPayload)
  payload: ToBackendSetProjectWeekStartRequestPayload;
}

export class ToBackendSetProjectWeekStartResponsePayload {
  @ValidateNested()
  @Type(() => common.Project)
  project: common.Project;
}

export class ToBackendSetProjectWeekStartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectWeekStartResponsePayload)
  payload: ToBackendSetProjectWeekStartResponsePayload;
}
