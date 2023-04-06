import { ConfigService } from '@nestjs/config';
import { barRep } from '~blockml/barrels/bar-rep';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildRep(
  item: {
    reps: common.FileRep[];
    metrics: common.MetricAny[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let reps = item.reps;

  reps = barRep.checkRep(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barRep.checkRepAccess(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barRep.checkRepRowUnknownParameters(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barRep.checkRepRowUnknownParams(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barRep.checkRepRow(
    {
      reps: reps,
      metrics: item.metrics,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barRep.checkRepRowIds(
    {
      reps: reps,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  reps = barRep.checkRepRowParameters(
    {
      reps: reps,
      metrics: item.metrics,
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return reps;
}
