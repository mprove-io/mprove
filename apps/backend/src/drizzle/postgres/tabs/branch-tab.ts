import { BranchEnt } from '../schema/branches';

export interface BranchTab
  extends Omit<BranchEnt, 'st' | 'lt'>,
    BranchSt,
    BranchLt {}

export class BranchSt {
  emptyData?: number;
}

export class BranchLt {
  emptyData?: number;
}
