import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartData;

export function checkChartData<T extends types.dzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.data)) {
        return;
      }

      Object.keys(report.data)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.XField.toString(),
              enums.ParameterEnum.YField.toString(),
              enums.ParameterEnum.YFields.toString(),
              enums.ParameterEnum.HideColumns.toString(),
              enums.ParameterEnum.MultiField.toString(),
              enums.ParameterEnum.ValueField.toString(),
              enums.ParameterEnum.PreviousValueField.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DATA_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used ` +
                  'inside Report Data',
                lines: [
                  {
                    line: report.data[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(report.data[parameter]) &&
            [
              enums.ParameterEnum.YFields.toString(),
              enums.ParameterEnum.HideColumns.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DATA_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a List`,
                lines: [
                  {
                    line: report.data[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (report.data[parameter]?.constructor === Object) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DATA_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a Dictionary`,
                lines: [
                  {
                    line: report.data[parameter + constants.LINE_NUM],
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
