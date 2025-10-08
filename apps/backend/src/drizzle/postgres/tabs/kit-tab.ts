import { KitEnt } from '../schema/kits';

export interface KitTab extends Omit<KitEnt, 'st' | 'lt'>, KitSt, KitLt {}

export class KitSt {
  emptyData?: number;
}

export class KitLt {
  data: any;
}
