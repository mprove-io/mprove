import { ConfigService } from '@nestjs/config';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FileReport } from '#common/interfaces/blockml/internal/file-report';
import { FileReportRow } from '#common/interfaces/blockml/internal/file-report-row';
import { MyRegex } from '#common/models/my-regex';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

let func = FuncEnum.CheckReportRowUnknownParameters;

export function checkReportRowUnknownParameters(
  item: {
    reports: FileReport[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows.forEach(row => {
      Object.keys(row)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.RowId.toString(),
              ParameterEnum.Type.toString(),
              ParameterEnum.Name.toString(),
              ParameterEnum.Metric.toString(),
              ParameterEnum.ShowChart.toString(),
              ParameterEnum.Formula.toString(),
              ParameterEnum.Parameters.toString(),
              ParameterEnum.FormatNumber.toString(),
              ParameterEnum.CurrencyPrefix.toString(),
              ParameterEnum.CurrencySuffix.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNKNOWN_ROW_PARAMETER,
                message: `parameter "${parameter}" cannot be used inside Row`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
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
            [ParameterEnum.Parameters.toString()].indexOf(parameter) < 0 &&
            Array.isArray(row[parameter as keyof FileReportRow])
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_LIST_IN_ROW_PARAMETERS,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (row[parameter as keyof FileReportRow]?.constructor === Object) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_DICTIONARY_IN_ROW_PARAMETERS,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
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
            [ParameterEnum.Parameters.toString()].indexOf(parameter) > -1 &&
            !Array.isArray(row[parameter as keyof FileReportRow])
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.ROW_PARAMETER_MUST_BE_A_LIST,
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
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
            [ParameterEnum.ShowChart.toString()].indexOf(parameter) > -1 &&
            !(row[parameter as keyof FileReportRow] as any)
              .toString()
              .match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.ROW_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
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
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newReports);

  return newReports;
}
