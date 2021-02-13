import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';

export class Project {
  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsString()
  timezone: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @IsBoolean()
  allowTimezones: boolean;

  @IsInt()
  serverTs: number;
}
