import { IsString } from 'class-validator';
import { OrgEnt } from '../schema/orgs';

export interface OrgTab extends Omit<OrgEnt, 'st' | 'lt'> {
  st: OrgSt;
  lt: OrgLt;
}

export class OrgSt {
  @IsString()
  name: string;

  @IsString()
  ownerEmail: string;
}

export class OrgLt {
  emptyData?: number;
}
