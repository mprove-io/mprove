import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckSelectForceDims;

export function checkSelectForceDims<T extends types.vdType>(item: {
  entities: Array<T>;
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
      report.selectWithForceDims = [...report.select];

      Object.keys(report.selectHash).forEach(element => {
        Object.keys(report.selectHash[element]).forEach(fDim => {
          // if (!report.selectHash[dim]) {
          //   // error e90
          //   item.errors.push(
          //     new BmError({
          //       title: 'calculation needs dimension',
          //       message: `calculation "${element}" needs dimension "${dim}" in select`,
          //       lines: [
          //         {
          //           line: report.select_line_num,
          //           name: x.fileName,
          //           path: x.filePath
          //         }
          //       ]
          //     })
          //   );
          //   return;
          // }

          report.selectWithForceDims.push(fDim);
        });
      });

      report.selectWithForceDims.forEach(el => {
        if (helper.isUndefined(report.selectHash[el])) {
          report.selectHash[el] = {};
        }
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
