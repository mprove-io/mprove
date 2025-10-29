import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { MPROVE_CONFIG_FILENAME } from '~common/constants/top';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { MyRegex } from '~common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckTopUnknownParameters;

export function checkTopUnknownParameters(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): any[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            ParameterEnum.Path.toString(),
            ParameterEnum.Ext.toString(),
            ParameterEnum.Name.toString()
          ].indexOf(parameter) > -1
        ) {
          return;
        }

        switch (file.ext) {
          case FileExtensionEnum.Store: {
            if (
              [
                ParameterEnum.Store.toString(),
                ParameterEnum.Connection.toString(),
                ParameterEnum.Label.toString(),
                ParameterEnum.AccessRoles.toString(),
                ParameterEnum.Method.toString(),
                ParameterEnum.Preset.toString(),
                ParameterEnum.Request.toString(),
                ParameterEnum.Response.toString(),
                ParameterEnum.DateRangeIncludesRightSide.toString(),
                ParameterEnum.Parameters.toString(),
                ParameterEnum.Results.toString(),
                ParameterEnum.BuildMetrics.toString(),
                ParameterEnum.FieldGroups.toString(),
                ParameterEnum.FieldTimeGroups.toString(),
                ParameterEnum.Fields.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNKNOWN_STORE_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${FileExtensionEnum.Store} file`,
                  lines: [
                    {
                      line: file[parameter + LINE_NUM],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case FileExtensionEnum.Dashboard: {
            if (
              [
                ParameterEnum.Dashboard.toString(),
                ParameterEnum.Title.toString(),
                ParameterEnum.AccessRoles.toString(),
                ParameterEnum.Parameters.toString(),
                ParameterEnum.Tiles.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNKNOWN_DASHBOARD_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${FileExtensionEnum.Dashboard} file`,
                  lines: [
                    {
                      line: file[parameter + LINE_NUM],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case FileExtensionEnum.Chart: {
            if (
              [
                ParameterEnum.Chart.toString(),
                ParameterEnum.Tiles.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNKNOWN_CHART_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${FileExtensionEnum.Chart} file`,
                  lines: [
                    {
                      line: file[parameter + LINE_NUM],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case FileExtensionEnum.Report: {
            if (
              [
                ParameterEnum.Report.toString(),
                ParameterEnum.Title.toString(),
                ParameterEnum.Parameters.toString(),
                ParameterEnum.AccessRoles.toString(),
                ParameterEnum.Options.toString(),
                ParameterEnum.Rows.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNKNOWN_REPORT_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${FileExtensionEnum.Report} file`,
                  lines: [
                    {
                      line: file[parameter + LINE_NUM],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case FileExtensionEnum.Yml: {
            if (
              [
                ParameterEnum.MproveDir.toString(),
                ParameterEnum.WeekStart.toString(),
                ParameterEnum.DefaultTimezone.toString(),
                ParameterEnum.AllowTimezones.toString(),
                ParameterEnum.FormatNumber.toString(),
                ParameterEnum.CurrencyPrefix.toString(),
                ParameterEnum.CurrencySuffix.toString(),
                ParameterEnum.ThousandsSeparator.toString(),
                ParameterEnum.CaseSensitiveStringFilters.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.UNKNOWN_MPROVE_CONFIG_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${MPROVE_CONFIG_FILENAME} file`,
                  lines: [
                    {
                      line: file[parameter + LINE_NUM],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }
        }

        if (
          Array.isArray(file[parameter]) &&
          [
            ParameterEnum.Parameters.toString(),
            ParameterEnum.Fields.toString(),
            ParameterEnum.Tiles.toString(),
            ParameterEnum.BuildMetrics.toString(),
            ParameterEnum.FieldGroups.toString(),
            ParameterEnum.FieldTimeGroups.toString(),
            ParameterEnum.Results.toString(),
            ParameterEnum.Rows.toString(),
            ParameterEnum.AccessRoles.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: file[parameter + LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
          return;
        }

        if (
          file[parameter]?.constructor === Object &&
          [ParameterEnum.Options.toString()].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: file[parameter + LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
          return;
        }

        if (
          [ParameterEnum.Options.toString()].indexOf(parameter) > -1 &&
          file[parameter]?.constructor !== Object
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.PARAMETER_IS_NOT_A_DICTIONARY,
              message: `parameter "${parameter}" must be a dictionary`,
              lines: [
                {
                  line: file[parameter + LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
          return;
        }

        if (
          !Array.isArray(file[parameter]) &&
          [
            ParameterEnum.Parameters.toString(),
            ParameterEnum.Fields.toString(),
            ParameterEnum.Tiles.toString(),
            ParameterEnum.BuildMetrics.toString(),
            ParameterEnum.FieldGroups.toString(),
            ParameterEnum.FieldTimeGroups.toString(),
            ParameterEnum.Results.toString(),
            ParameterEnum.Rows.toString(),
            ParameterEnum.AccessRoles.toString()
          ].indexOf(parameter) > -1
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.PARAMETER_IS_NOT_A_LIST,
              message: `parameter "${parameter}" must be a List`,
              lines: [
                {
                  line: file[parameter + LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
          return;
        }
      });

    if (errorsOnStart === item.errors.length) {
      newFilesAny.push(file);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
