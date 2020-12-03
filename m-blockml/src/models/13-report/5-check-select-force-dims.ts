import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckSelectForceDims;

export function checkSelectForceDims(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      report.selectWithForceDims = [...report.select];

      Object.keys(report.selectHash).forEach(element => {
        Object.keys(report.selectHash[element]).forEach(dim => {
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

          report.selectHash[dim] = {};
          report.selectWithForceDims.push(dim);
        });
      });
    });

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
