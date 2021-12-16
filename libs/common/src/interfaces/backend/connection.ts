import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Connection {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsEnum(enums.ConnectionTypeEnum)
  type: enums.ConnectionTypeEnum;

  @IsString()
  bigqueryProject: string;

  @IsString()
  bigqueryClientEmail: string;

  @IsInt()
  bigqueryQuerySizeLimitGb: number;

  @IsString()
  postgresHost: string;

  @IsInt()
  postgresPort: number;

  @IsString()
  postgresDatabase: string;

  @IsString()
  postgresUser: string;

  @IsBoolean()
  isSSL: boolean;

  @IsInt()
  serverTs: number;
}
