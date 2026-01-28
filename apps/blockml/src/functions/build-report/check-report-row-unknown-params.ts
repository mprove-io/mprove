import { ConfigService } from '@nestjs/config';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { FileReport } from '#common/interfaces/blockml/internal/file-report';
import { FileReportRowParameter } from '#common/interfaces/blockml/internal/file-report-row-parameter';
import { MyRegex } from '#common/models/my-regex';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

let func = FuncEnum.CheckReportRowUnknownParams;

export function checkReportRowUnknownParams(
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

    x.rows
      .filter(row => isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(param => {
          Object.keys(param)
            .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .forEach(parameter => {
              if (
                [
                  ParameterEnum.ApplyTo.toString(),
                  ParameterEnum.Listen.toString(),
                  ParameterEnum.Conditions.toString(),
                  ParameterEnum.Fractions.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.UNKNOWN_PARAMETER,
                    message: `parameter "${parameter}" cannot be used inside Parameter`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
                [
                  ParameterEnum.Conditions.toString(),
                  ParameterEnum.Fractions.toString()
                ].indexOf(parameter) < 0 &&
                Array.isArray(param[parameter as keyof FileReportRowParameter])
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.UNEXPECTED_LIST_IN_PARAMETERS,
                    message: `parameter "${parameter}" cannot be a list`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
                param[parameter as keyof FileReportRowParameter]
                  ?.constructor === Object
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.UNEXPECTED_DICTIONARY_IN_PARAMETERS,
                    message: `parameter "${parameter}" cannot be a dictionary`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
                [
                  ParameterEnum.Conditions.toString(),
                  ParameterEnum.Fractions.toString()
                ].indexOf(parameter) > -1 &&
                !Array.isArray(param[parameter as keyof FileReportRowParameter])
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.PARAMETER_MUST_BE_A_LIST,
                    message: `parameter "${parameter}" must be a list`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
      });

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newReports);

  return newReports;
}
