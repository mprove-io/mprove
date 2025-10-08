import { OrgEnt } from '../schema/orgs';

export interface OrgTab extends Omit<OrgEnt, 'st' | 'lt'>, OrgSt, OrgLt {}

export class OrgSt {
  name: string;
  ownerEmail: string;
}

export class OrgLt {
  emptyData?: number;
}
