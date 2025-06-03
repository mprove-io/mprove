import { IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class ProjectConnection {
  @IsString()
  connectionId: string;

  @IsEnum(enums.ConnectionTypeEnum)
  type: enums.ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  googleCloudProject?: string;

  postgresHost?: string;
  postgresPort?: number;
  postgresUsername?: string;
  postgresPassword?: string;
  postgresDatabaseName?: string;
  postgresConnectionString?: string;
}
