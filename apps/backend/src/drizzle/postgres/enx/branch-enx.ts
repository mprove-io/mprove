import { BranchEnt } from '../schema/branches';

export interface BranchEnx extends Omit<BranchEnt, 'st' | 'lt'> {
  st: BranchSt;
  lt: BranchLt;
}

export class BranchSt {}

export class BranchLt {}
