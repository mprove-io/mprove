import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartData;

export function checkChartData<T extends types.dzType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (common.isUndefined(report.data)) {
        return;
      }

      Object.keys(report.data)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.XField.toString(),
              common.ParameterEnum.YField.toString(),
              common.ParameterEnum.YFields.toString(),
              common.ParameterEnum.HideColumns.toString(),
              common.ParameterEnum.MultiField.toString(),
              common.ParameterEnum.ValueField.toString(),
              common.ParameterEnum.PreviousValueField.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used ` +
                  'inside Report Data',
                lines: [
                  {
                    line: report.data[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartData
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(
              report.data[parameter as keyof common.FileChartData] as any
            ) &&
            [
              common.ParameterEnum.YFields.toString(),
              common.ParameterEnum.HideColumns.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a List`,
                lines: [
                  {
                    line: report.data[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartData
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            (report.data[parameter as keyof common.FileChartData] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a Dictionary`,
                lines: [
                  {
                    line: report.data[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartData
                    ] as number,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
