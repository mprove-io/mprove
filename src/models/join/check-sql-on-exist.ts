import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkSqlOnExist(item: {
  models: interfaces.Model[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {

        if (nextModel) { return; }

        if (typeof join.sql_on === 'undefined' || join.sql_on === null) {
          // error e19
          ErrorsCollector.addError(new AmError({
            title: `missing sql_on`,
            message: `'sql_on:' is required for each 'join_view:'`,
            lines: [{
              line: join.join_view_line_num,
              name: x.file,
              path: x.path,
            }],
          }));

          nextModel = true;
          return;
        }
      });

    if (nextModel) { return; }

    newModels.push(x);
  });

  return newModels;
}