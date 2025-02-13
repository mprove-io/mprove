import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Connection {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsString()
  envId: string;

  @IsEnum(enums.ConnectionTypeEnum)
  type: enums.ConnectionTypeEnum;

  @IsString()
  googleCloudProject: string;

  @IsString()
  googleCloudClientEmail: string;

  @IsInt()
  bigqueryQuerySizeLimitGb: number;

  @IsString()
  account: string;

  @IsString()
  warehouse: string;

  @IsString()
  host: string;

  @IsInt()
  port: number;

  @IsString()
  database: string;

  @IsString()
  username: string;

  @IsBoolean()
  isSSL: boolean;

  @IsInt()
  serverTs: number;
}
