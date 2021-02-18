import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsString()
  timezone: string;

  @IsEnum(enums.ProjectWeekStartEnum)
  weekStart: enums.ProjectWeekStartEnum;

  @IsBoolean()
  allowTimezones: boolean;

  @IsInt()
  serverTs: number;
}
