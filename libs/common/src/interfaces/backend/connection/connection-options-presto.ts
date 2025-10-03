import { IsInt, IsOptional } from 'class-validator';
import { ConnectionOptionsPrestoTrinoCommon } from './connection-options-presto-trino-common';

export class ConnectionOptionsPresto extends ConnectionOptionsPrestoTrinoCommon {
  @IsOptional()
  @IsInt()
  port?: number;
}
