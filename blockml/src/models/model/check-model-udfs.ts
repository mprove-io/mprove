import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkModelUdfs(item: {
  models: interfaces.Model[];
  udfs: interfaces.Udf[];
}) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let nextModel: boolean = false;

    if (typeof x.udfs !== 'undefined' && x.udfs !== null) {
      if (!Array.isArray(x.udfs)) {
        // error e213
        ErrorsCollector.addError(
          new AmError({
            title: `udfs must be an Array`,
            message: `"udfs" must have element(s) inside like:
- 'user_defined_function_name'
- 'user_defined_function_name'`,
            lines: [
              {
                line: x.udfs_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        nextModel = true;
        return;
      } else {
        x.udfs.forEach(u => {
          if (nextModel) {
            return;
          }

          if (item.udfs.findIndex(udf => udf.name === u) < 0) {
            // error e214
            ErrorsCollector.addError(
              new AmError({
                title: `wrong udf`,
                message: `found element "- ${u}" references missing or not valid udf`,
                lines: [
                  {
                    line: x.udfs_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            nextModel = true;
            return;
          }
        });
      }
    }

    if (nextModel) {
      return;
    }

    newModels.push(x);
  });

  return newModels;
}
