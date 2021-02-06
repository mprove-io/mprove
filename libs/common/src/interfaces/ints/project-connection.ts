import { IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class ProjectConnection {
  @IsString()
  name: string;

  @IsEnum(enums.ConnectionTypeEnum)
  type: enums.ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  bigqueryProject?: string;
}
