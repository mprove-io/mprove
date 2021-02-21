import { IsInt, IsString } from 'class-validator';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  // @IsString()
  // timezone: string;

  // @IsEnum(enums.ProjectWeekStartEnum)
  // weekStart: enums.ProjectWeekStartEnum;

  // @IsBoolean()
  // allowTimezones: boolean;

  @IsInt()
  serverTs: number;
}
