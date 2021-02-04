import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

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

  @IsEnum(enums.ProjectWeekStartEnum)
  readonly weekStart: enums.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => interfaces.ProjectConnection)
  readonly connections: interfaces.ProjectConnection[];
}

export class ToBackendRebuildStructSpecialRequest extends interfaces.ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRebuildStructSpecialRequestPayload)
  readonly payload: ToBackendRebuildStructSpecialRequestPayload;
}
