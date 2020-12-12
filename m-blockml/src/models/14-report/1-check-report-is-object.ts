import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckReportIsObject;

export function checkReportIsObject(item: {
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
      if (helper.isDefined(report) && report.constructor !== Object) {
        // error e131
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_IS_NOT_A_DICTIONARY,
            message: 'found at least one report that is not a dictionary',
            lines: [
              {
                line: x.reports_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
