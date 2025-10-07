import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ConnectionOptions } from '~common/interfaces/backend/connection-parts/connection-options';
import { ConnectionEnt } from '../schema/connections';

export interface ConnectionMt extends Omit<ConnectionEnt, 'st' | 'lt'> {
  st: ConnectionSt;
  lt: ConnectionLt;
}

export class ConnectionSt {}

export class ConnectionLt {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptions)
  options?: ConnectionOptions;
}
