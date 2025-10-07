import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Ev } from '~common/interfaces/backend/ev';
import { EnvEnt } from '../schema/envs';

export interface EnvEnx extends Omit<EnvEnt, 'st' | 'lt'> {
  st: EnvSt;
  lt: EnvLt;
}

export class EnvSt {
  @ValidateNested()
  @Type(() => Ev)
  evs: Ev[];
}

export class EnvLt {}
