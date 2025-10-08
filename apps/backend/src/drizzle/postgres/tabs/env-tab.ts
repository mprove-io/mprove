import { Ev } from '~common/interfaces/backend/ev';
import { EnvEnt } from '../schema/envs';

export interface EnvTab extends Omit<EnvEnt, 'st' | 'lt'>, EnvSt, EnvLt {}

export class EnvSt {
  evs: Ev[];
}

export class EnvLt {
  emptyData?: number;
}
