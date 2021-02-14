import { IsEnum, IsInt, IsString } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';

export class Connection {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsEnum(common.ConnectionTypeEnum)
  type: common.ConnectionTypeEnum;

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
