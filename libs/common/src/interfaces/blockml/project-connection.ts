import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';

export class ProjectConnection {
  @IsString()
  connectionId: string;

  @IsEnum(ConnectionTypeEnum)
  type: ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  googleCloudProject?: string;

  host?: string;
  port?: number;
  username?: string;
  password?: string;
  databaseName?: string;
}
