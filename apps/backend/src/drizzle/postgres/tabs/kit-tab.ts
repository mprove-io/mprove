import { KitEnt } from '../schema/kits';

export interface KitTab extends Omit<KitEnt, 'st' | 'lt'> {
  st: KitSt;
  lt: KitLt;
}

export class KitSt {}

export class KitLt {
  data: any;
}
