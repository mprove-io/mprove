import { IsInt, IsOptional } from 'class-validator';
import { ConnectionPrestoTrinoCommonOptions } from './connection-presto-trino-common-options';

export class ConnectionPrestoOptions extends ConnectionPrestoTrinoCommonOptions {
  @IsOptional()
  @IsInt()
  port?: number;
}
