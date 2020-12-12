import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckLimit;

export function checkLimit(item: {
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
      if (!report.limit) {
        report.limit = constants.LIMIT_500;
        return;
      }

      let reg = api.MyRegex.CAPTURE_DIGITS_START_TO_END_G();
      let r = reg.exec(report.limit);

      if (helper.isUndefined(r)) {
        // error e168
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_WRONG_LIMIT,
            message: `"${enums.ParameterEnum.Limit}" must contain positive integer value`,
            lines: [
              {
                line: report.limit_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let limitNumber = Number(r[1]);

      report.limit =
        limitNumber > 500 ? constants.LIMIT_500 : limitNumber.toString();
    });

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
