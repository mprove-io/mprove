import { BranchEnt } from '../schema/branches';

export interface BranchTab extends Omit<BranchEnt, 'st' | 'lt'> {
  st: BranchSt;
  lt: BranchLt;
}

export class BranchSt {
  emptyData?: number;
}

export class BranchLt {
  emptyData?: number;
}
