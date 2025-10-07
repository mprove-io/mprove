import { IsString } from 'class-validator';
import { OrgEnt } from '../schema/orgs';

export interface OrgMt extends Omit<OrgEnt, 'st' | 'lt'> {
  st: OrgSt;
  lt: OrgLt;
}

export class OrgSt {}

export class OrgLt {
  @IsString()
  name: string;

  @IsString()
  ownerEmail: string;
}
