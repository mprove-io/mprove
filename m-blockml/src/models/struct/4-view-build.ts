import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from 'src/barrels/interfaces';
import { barView } from '../../barrels/bar-view';

export function viewBuild(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let views = item.views;

  views = barView.checkTable({
    views: views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  return views;
}
