import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barViz } from '../../barrels/bar-viz';
import { ConfigService } from '@nestjs/config';

export function buildViz(
  item: {
    vizs: interfaces.Viz[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let vizs = item.vizs;

  vizs = barViz.checkVizAccess(
    {
      vizs: vizs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  vizs = barViz.checkVizReportsExist(
    {
      vizs: vizs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return vizs;
}
