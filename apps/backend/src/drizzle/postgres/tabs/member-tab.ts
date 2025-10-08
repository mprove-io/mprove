import { MemberEnt } from '../schema/members';

export interface MemberTab
  extends Omit<MemberEnt, 'st' | 'lt'>,
    MemberSt,
    MemberLt {}

export class MemberSt {
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export class MemberLt {
  emptyData?: number;
}
