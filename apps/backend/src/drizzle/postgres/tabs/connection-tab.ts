import { ConnectionOptions } from '~common/interfaces/backend/connection-parts/connection-options';
import { ConnectionEnt } from '../schema/connections';

export interface ConnectionTab
  extends Omit<ConnectionEnt, 'st' | 'lt'>,
    ConnectionSt,
    ConnectionLt {}

export class ConnectionSt {
  options?: ConnectionOptions;
}

export class ConnectionLt {
  emptyData?: number;
}
