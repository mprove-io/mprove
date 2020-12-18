import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckSqlAlwaysWhereCalcForceDims;

export function checkSqlAlwaysWhereCalcForceDims<T extends types.dzType>(item: {
  entities: Array<T>;
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      let model = item.models.find(m => m.name === report.model);

      if (helper.isUndefined(model.sqlAlwaysWhereCalcForceDims)) {
        return;
      }

      Object.keys(model.sqlAlwaysWhereCalcForceDims).forEach(alias => {
        Object.keys(model.sqlAlwaysWhereCalcForceDims[alias]).forEach(dim => {
          let fDim = `${alias}.${dim}`;

          if (helper.isUndefined(report.selectHash[fDim])) {
            // // error e156
            // item.errors.push(
            //   new BmError({
            //     title: `sql_always_where_calc needs dimension`,
            //     message: `'sql_always_where_calc:' needs dimension "${fDim}" in select`,
            //     lines: [
            //       {
            //         line: report.select_line_num,
            //         name: x.fileName,
            //         path: x.filePath
            //       }
            //     ]
            //   })
            // );
            // return;

            report.selectWithForceDims.push(fDim);
            report.selectHash[fDim] = {};
          }
        });
      });
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
