import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartAxisParameters;

export function checkChartAxisParameters<T extends types.dzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.axis)) {
        return;
      }

      Object.keys(report.axis)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
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
            !report.axis[parameter]
              .toString()
              .match(common.MyRegex.TRUE_FALSE())
          ) {
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
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
