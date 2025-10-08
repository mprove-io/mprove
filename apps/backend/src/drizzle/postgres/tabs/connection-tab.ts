import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ConnectionOptions } from '~common/interfaces/backend/connection-parts/connection-options';
import { ConnectionEnt } from '../schema/connections';

export interface ConnectionTab extends Omit<ConnectionEnt, 'st' | 'lt'> {
  st: ConnectionSt;
  lt: ConnectionLt;
}

export class ConnectionSt {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptions)
  options?: ConnectionOptions;
}

export class ConnectionLt {
  emptyData?: number;
}
