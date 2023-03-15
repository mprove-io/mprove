import { ConfigService } from '@nestjs/config';
import { barRep } from '~blockml/barrels/bar-rep';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildRep(
  item: {
    reps: common.FileRep[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let reps = item.reps;

  reps = barRep.checkRepAccess(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return reps;
}
