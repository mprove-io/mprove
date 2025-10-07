import { IsOptional, IsString } from 'class-validator';
import { MemberEnt } from '../schema/members';

export interface MemberMt extends Omit<MemberEnt, 'st' | 'lt'> {
  st: MemberSt;
  lt: MemberLt;
}

export class MemberSt {}

export class MemberLt {
  @IsString()
  email: string;

  @IsString()
  alias: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsString({ each: true })
  roles: string[];
}
