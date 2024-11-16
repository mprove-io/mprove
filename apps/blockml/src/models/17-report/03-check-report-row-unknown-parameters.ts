import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckReportRowUnknownParameters;

export function checkReportRowUnknownParameters(
  item: {
    reps: common.FileReport[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReps: common.FileReport[] = [];

  item.reps.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows.forEach(row => {
      Object.keys(row)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.RowId.toString(),
              common.ParameterEnum.Type.toString(),
              common.ParameterEnum.Name.toString(),
              common.ParameterEnum.Metric.toString(),
              common.ParameterEnum.ShowChart.toString(),
              common.ParameterEnum.Formula.toString(),
              common.ParameterEnum.Parameters.toString(),
              common.ParameterEnum.ParametersFormula.toString(),
              common.ParameterEnum.FormatNumber.toString(),
              common.ParameterEnum.CurrencyPrefix.toString(),
              common.ParameterEnum.CurrencySuffix.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_ROW_PARAMETER,
                message: `parameter "${parameter}" can not be used inside Row`,
                lines: [
                  {
                    line: row[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileReportRow
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
            [common.ParameterEnum.Parameters.toString()].indexOf(parameter) <
              0 &&
            Array.isArray(row[parameter as keyof common.FileReportRow])
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST_IN_ROW_PARAMETERS,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: row[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileReportRow
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
            row[parameter as keyof common.FileReportRow]?.constructor === Object
            //  &&
            // [
            //   common.ParameterEnum.RowId.toString()
            // ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_ROW_PARAMETERS,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: row[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileReportRow
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
            [common.ParameterEnum.Parameters.toString()].indexOf(parameter) >
              -1 &&
            !Array.isArray(row[parameter as keyof common.FileReportRow])
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.ROW_PARAMETER_MUST_BE_A_LIST,
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: row[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileReportRow
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
            [common.ParameterEnum.ShowChart.toString()].indexOf(parameter) >
              -1 &&
            !(row[parameter as keyof common.FileReportRow] as any)
              .toString()
              .match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.ROW_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: row[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileReportRow
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
      newReps.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Entities, newReps);

  return newReps;
}
