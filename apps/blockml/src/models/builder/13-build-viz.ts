import { ConfigService } from '@nestjs/config';
import { barViz } from '~blockml/barrels/bar-viz';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildViz(
  item: {
    vizs: common.FileVis[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
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
