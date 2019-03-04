import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkTable(item: {
  views: interfaces.View[]
}) {

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {

    if (Object.keys(x).indexOf('table') < 0
      && Object.keys(x).indexOf('derived_table') < 0) {

      // error e136
      ErrorsCollector.addError(new AmError({
        title: `missing table`,
        message: `view must have "table:" or "derived_table:" parameter`,
        lines: [{
          line: x.view_line_num,
          name: x.file,
          path: x.path,
        }],
      }));
      return;
    }

    newViews.push(x);
  });

  return newViews;
}
