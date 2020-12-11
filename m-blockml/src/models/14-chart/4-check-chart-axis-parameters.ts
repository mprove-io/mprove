import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckChartAxisParameters;

export function checkChartAxisParameters(item: {
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
      if (helper.isUndefined(report.axis)) {
        return;
      }

      Object.keys(report.axis)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.XAxis.toString(),
              enums.ParameterEnum.ShowXAxisLabel.toString(),
              enums.ParameterEnum.XAxisLabel.toString(),
              enums.ParameterEnum.YAxis.toString(),
              enums.ParameterEnum.ShowYAxisLabel.toString(),
              enums.ParameterEnum.YAxisLabel.toString(),
              enums.ParameterEnum.ShowAxis.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_AXIS_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used  ` +
                  'inside Report Axis',
                lines: [
                  {
                    line: report.axis[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (Array.isArray(report.axis[parameter])) {
            // error e185
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_AXIS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a List`,
                lines: [
                  {
                    line: report.axis[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (report.axis[parameter]?.constructor === Object) {
            // error e186
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_AXIS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a Dictionary`,
                lines: [
                  {
                    line: report.axis[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            [
              enums.ParameterEnum.XAxis.toString(),
              enums.ParameterEnum.ShowXAxisLabel.toString(),
              enums.ParameterEnum.YAxis.toString(),
              enums.ParameterEnum.ShowYAxisLabel.toString(),
              enums.ParameterEnum.ShowAxis.toString()
            ].indexOf(parameter) > -1 &&
            !report.axis[parameter].toString().match(api.MyRegex.TRUE_FALSE())
          ) {
            // error e187
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_AXIS_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: report.axis[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
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
