import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barViz } from '../../barrels/bar-viz';

export function buildViz(item: {
  vizs: interfaces.Viz[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let vizs = item.vizs;

  vizs = barViz.checkVizAccessUsers({
    vizs: vizs,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  vizs = barViz.checkVizReportsExist({
    vizs: vizs,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return vizs;
}
