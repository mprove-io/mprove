import { KitEnt } from '../schema/kits';

export interface KitEnx extends Omit<KitEnt, 'st' | 'lt'> {
  st: KitSt;
  lt: KitLt;
}

export class KitSt {}

export class KitLt {
  data: any;
}
