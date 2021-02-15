import { IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Connection {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsEnum(enums.ConnectionTypeEnum)
  type: enums.ConnectionTypeEnum;

  @IsString()
  bigqueryCredentials: string;

  @IsInt()
  bigqueryQuerySizeLimit: number;

  @IsString()
  postgresHost: string;

  @IsInt()
  postgresPort: number;

  @IsString()
  postgresDatabase: string;

  @IsString()
  postgresUser: string;

  @IsString()
  postgresPassword: string;

  @IsInt()
  serverTs: number;
}
