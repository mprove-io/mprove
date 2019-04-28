import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkPdtTriggerTime(item: { views: interfaces.View[] }) {
  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    if (
      Object.keys(x).indexOf('derived_table') > -1 &&
      Object.keys(x).indexOf('pdt_trigger_time') > -1 &&
      x.permanent.match(ApRegex.FALSE())
    ) {
      // error e291
      ErrorsCollector.addError(
        new AmError({
          title: `useless pdt_trigger_time`,
          message: `pdt_trigger_time only works with 'permanent: true' parameter`,
          lines: [
            {
              line: x.pdt_trigger_time_line_num,
              name: x.file,
              path: x.path
            }
          ]
        })
      );
      return;
    }

    newViews.push(x);
  });

  return newViews;
}
