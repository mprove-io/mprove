import { BridgeEnt } from '../schema/bridges';

export interface BridgeTab extends Omit<BridgeEnt, 'st' | 'lt'> {
  st: BridgeSt;
  lt: BridgeLt;
}

export class BridgeSt {
  emptyData?: number;
}

export class BridgeLt {
  emptyData?: number;
}
