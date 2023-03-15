import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckReportUnknownParameters;

export function checkReportUnknownParameters<T extends types.dzType>(
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
      Object.keys(report)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.Title.toString(),
              common.ParameterEnum.Description.toString(),
              common.ParameterEnum.Model.toString(),
              common.ParameterEnum.Select.toString(),
              common.ParameterEnum.Sorts.toString(),
              common.ParameterEnum.Timezone.toString(),
              common.ParameterEnum.Limit.toString(),
              common.ParameterEnum.Type.toString(),
              common.ParameterEnum.DefaultFilters.toString(),
              common.ParameterEnum.ListenFilters.toString(),
              common.ParameterEnum.Data.toString(),
              common.ParameterEnum.Axis.toString(),
              common.ParameterEnum.Options.toString(),
              common.ParameterEnum.Tile.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_REPORT_PARAMETER,
                message: `parameter "${parameter}" can not be used inside Report`,
                lines: [
                  {
                    line: report[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartReport
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
            [common.ParameterEnum.Select.toString()].indexOf(parameter) < 0 &&
            Array.isArray(report[parameter as keyof common.FilePartReport])
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST_IN_REPORT_PARAMETERS,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: report[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartReport
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
            report[parameter as keyof common.FilePartReport]?.constructor ===
              Object &&
            [
              common.ParameterEnum.DefaultFilters.toString(),
              common.ParameterEnum.ListenFilters.toString(),
              common.ParameterEnum.Data.toString(),
              common.ParameterEnum.Axis.toString(),
              common.ParameterEnum.Options.toString(),
              common.ParameterEnum.Tile.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_REPORT_PARAMETERS,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: report[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartReport
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
            [common.ParameterEnum.Select.toString()].indexOf(parameter) > -1 &&
            !Array.isArray(report[parameter as keyof common.FilePartReport])
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_PARAMETER_MUST_BE_A_LIST,
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: report[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartReport
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
            common.isDefined(
              report[parameter as keyof common.FilePartReport]
            ) &&
            report[parameter as keyof common.FilePartReport].constructor !==
              Object &&
            [
              common.ParameterEnum.DefaultFilters.toString(),
              common.ParameterEnum.ListenFilters.toString(),
              common.ParameterEnum.Data.toString(),
              common.ParameterEnum.Axis.toString(),
              common.ParameterEnum.Options.toString(),
              common.ParameterEnum.Tile.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_PARAMETER_MUST_BE_A_DICTIONARY,
                message: `parameter "${parameter}" must be a dictionary`,
                lines: [
                  {
                    line: report[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartReport
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
