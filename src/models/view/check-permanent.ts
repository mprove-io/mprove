import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkPermanent(item: { views: interfaces.View[] }) {
  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    if (Object.keys(x).indexOf('derived_table') > -1) {
      if (
        Object.keys(x).indexOf('permanent') > -1 &&
        !x.permanent.match(ApRegex.TRUE_FALSE())
      ) {
        // error e215
        ErrorsCollector.addError(
          new AmError({
            title: `wrong permanent`,
            message: `permanent's value must be 'true' or 'false' if specified`,
            lines: [
              {
                line: x.permanent_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      } else if (Object.keys(x).indexOf('permanent') < 0) {
        x.permanent = 'false';
      }
    }

    newViews.push(x);
  });

  return newViews;
}
