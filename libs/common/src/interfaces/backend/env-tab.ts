import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Ev } from './ev';

export class EnvTab {
  @ValidateNested()
  @Type(() => Ev)
  evs: Ev[];
}
