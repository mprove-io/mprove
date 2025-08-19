import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ConnectionHeader } from './connection-header';

export class Connection {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsString()
  envId: string;

  @IsEnum(ConnectionTypeEnum)
  type: ConnectionTypeEnum;

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
  baseUrl: string;

  @ValidateNested()
  @Type(() => ConnectionHeader)
  headers: ConnectionHeader[];

  @IsString({ each: true })
  googleAuthScopes?: string[];

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
