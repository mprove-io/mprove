import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { Project } from '~common/interfaces/backend/project';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetProjectWeekStartRequestPayload {
  @IsString()
  projectId: string;

  @IsEnum(ProjectWeekStartEnum)
  weekStart: ProjectWeekStartEnum;
}

export class ToBackendSetProjectWeekStartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectWeekStartRequestPayload)
  payload: ToBackendSetProjectWeekStartRequestPayload;
}

export class ToBackendSetProjectWeekStartResponsePayload {
  @ValidateNested()
  @Type(() => Project)
  project: Project;
}

export class ToBackendSetProjectWeekStartResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectWeekStartResponsePayload)
  payload: ToBackendSetProjectWeekStartResponsePayload;
}
