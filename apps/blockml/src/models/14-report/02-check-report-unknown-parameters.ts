import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckReportUnknownParameters;

export function checkReportUnknownParameters<T extends types.dzType>(
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
      Object.keys(report)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.Title.toString(),
              enums.ParameterEnum.Description.toString(),
              enums.ParameterEnum.Model.toString(),
              enums.ParameterEnum.Select.toString(),
              enums.ParameterEnum.Sorts.toString(),
              enums.ParameterEnum.Timezone.toString(),
              enums.ParameterEnum.Limit.toString(),
              enums.ParameterEnum.Type.toString(),
              enums.ParameterEnum.DefaultFilters.toString(),
              enums.ParameterEnum.ListenFilters.toString(),
              enums.ParameterEnum.Data.toString(),
              enums.ParameterEnum.Axis.toString(),
              enums.ParameterEnum.Options.toString(),
              enums.ParameterEnum.Tile.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.UNKNOWN_REPORT_PARAMETER,
                message: `parameter "${parameter}" can not be used inside Report`,
                lines: [
                  {
                    line: report[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            [enums.ParameterEnum.Select.toString()].indexOf(parameter) < 0 &&
            Array.isArray(report[parameter])
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.UNEXPECTED_LIST_IN_REPORT_PARAMETERS,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: report[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            report[parameter]?.constructor === Object &&
            [
              enums.ParameterEnum.DefaultFilters.toString(),
              enums.ParameterEnum.ListenFilters.toString(),
              enums.ParameterEnum.Data.toString(),
              enums.ParameterEnum.Axis.toString(),
              enums.ParameterEnum.Options.toString(),
              enums.ParameterEnum.Tile.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_REPORT_PARAMETERS,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: report[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            [enums.ParameterEnum.Select.toString()].indexOf(parameter) > -1 &&
            !Array.isArray(report[parameter])
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_PARAMETER_MUST_BE_A_LIST,
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: report[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            helper.isDefined(report[parameter]) &&
            report[parameter].constructor !== Object &&
            [
              enums.ParameterEnum.DefaultFilters.toString(),
              enums.ParameterEnum.ListenFilters.toString(),
              enums.ParameterEnum.Data.toString(),
              enums.ParameterEnum.Axis.toString(),
              enums.ParameterEnum.Options.toString(),
              enums.ParameterEnum.Tile.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_PARAMETER_MUST_BE_A_DICTIONARY,
                message: `parameter "${parameter}" must be a dictionary`,
                lines: [
                  {
                    line: report[parameter + constants.LINE_NUM],
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
