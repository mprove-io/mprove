import { BridgeEnt } from '../schema/bridges';

export interface BridgeEnx extends Omit<BridgeEnt, 'st' | 'lt'> {
  st: BridgeSt;
  lt: BridgeLt;
}

export class BridgeSt {}

export class BridgeLt {}
