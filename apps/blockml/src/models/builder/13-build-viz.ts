import { ConfigService } from '@nestjs/config';
import { barViz } from '~blockml/barrels/bar-viz';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildViz(
  item: {
    vizs: interfaces.Viz[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
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
