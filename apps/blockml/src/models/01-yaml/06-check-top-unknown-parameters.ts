import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckTopUnknownParameters;

export function checkTopUnknownParameters(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): any[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            enums.ParameterEnum.Path.toString(),
            enums.ParameterEnum.Ext.toString(),
            enums.ParameterEnum.Name.toString()
          ].indexOf(parameter) > -1
        ) {
          return;
        }

        switch (file.ext) {
          case common.FileExtensionEnum.Udf: {
            if (
              [
                enums.ParameterEnum.Udf.toString(),
                enums.ParameterEnum.Sql.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_UDF_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Udf} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.View: {
            if (
              [
                enums.ParameterEnum.View.toString(),
                enums.ParameterEnum.Connection.toString(),
                enums.ParameterEnum.Label.toString(),
                enums.ParameterEnum.Description.toString(),
                enums.ParameterEnum.Udfs.toString(),
                enums.ParameterEnum.Table.toString(),
                enums.ParameterEnum.DerivedTable.toString(),
                enums.ParameterEnum.Fields.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_VIEW_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.View} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Model: {
            if (
              [
                enums.ParameterEnum.Model.toString(),
                enums.ParameterEnum.Connection.toString(),
                enums.ParameterEnum.Label.toString(),
                // enums.ParameterEnum.Group.toString(),
                // enums.ParameterEnum.Hidden.toString(),
                enums.ParameterEnum.Description.toString(),
                enums.ParameterEnum.AccessUsers.toString(),
                enums.ParameterEnum.AccessRoles.toString(),
                enums.ParameterEnum.AlwaysJoin.toString(),
                enums.ParameterEnum.SqlAlwaysWhere.toString(),
                enums.ParameterEnum.SqlAlwaysWhereCalc.toString(),
                enums.ParameterEnum.Udfs.toString(),
                enums.ParameterEnum.Joins.toString(),
                enums.ParameterEnum.BuildMetrics.toString(),
                enums.ParameterEnum.SkipMetrics.toString(),
                enums.ParameterEnum.Fields.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_MODEL_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Model} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Dashboard: {
            if (
              [
                enums.ParameterEnum.Dashboard.toString(),
                enums.ParameterEnum.Title.toString(),
                // enums.ParameterEnum.Group.toString(),
                // enums.ParameterEnum.Hidden.toString(),
                enums.ParameterEnum.Description.toString(),
                enums.ParameterEnum.AccessUsers.toString(),
                enums.ParameterEnum.AccessRoles.toString(),
                enums.ParameterEnum.Fields.toString(),
                enums.ParameterEnum.Reports.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_DASHBOARD_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Dashboard} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Vis: {
            if (
              [
                enums.ParameterEnum.Vis.toString(),
                // enums.ParameterEnum.Group.toString(),
                // enums.ParameterEnum.Hidden.toString(),
                enums.ParameterEnum.AccessUsers.toString(),
                enums.ParameterEnum.AccessRoles.toString(),
                enums.ParameterEnum.Reports.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_VIS_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Vis} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Rep: {
            if (
              [
                enums.ParameterEnum.Report.toString(),
                enums.ParameterEnum.Title.toString(),
                enums.ParameterEnum.Rows.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_REP_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Rep} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Api: {
            if (
              [
                enums.ParameterEnum.Api.toString(),
                enums.ParameterEnum.Label.toString(),
                enums.ParameterEnum.Https.toString(),
                enums.ParameterEnum.Host.toString(),
                enums.ParameterEnum.Headers.toString(),
                enums.ParameterEnum.Steps.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_API_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Api} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Metric: {
            if (
              [
                enums.ParameterEnum.Metric.toString(),
                enums.ParameterEnum.Type.toString(),
                enums.ParameterEnum.Label.toString(),
                enums.ParameterEnum.TimeSpec.toString(),
                enums.ParameterEnum.Model.toString(),
                enums.ParameterEnum.Time.toString(),
                enums.ParameterEnum.Field.toString(),
                enums.ParameterEnum.Api.toString(),
                enums.ParameterEnum.Formula.toString(),
                enums.ParameterEnum.Sql.toString(),
                enums.ParameterEnum.Connection.toString(),
                enums.ParameterEnum.Description.toString(),
                enums.ParameterEnum.Params.toString(),
                enums.ParameterEnum.Entries.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_METRIC_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Metric} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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

          case common.FileExtensionEnum.Yml: {
            if (
              [
                enums.ParameterEnum.MproveDir.toString(),
                enums.ParameterEnum.WeekStart.toString(),
                enums.ParameterEnum.DefaultTimezone.toString(),
                enums.ParameterEnum.AllowTimezones.toString(),
                enums.ParameterEnum.FormatNumber.toString(),
                enums.ParameterEnum.CurrencyPrefix.toString(),
                enums.ParameterEnum.CurrencySuffix.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_MPROVE_CONFIG_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.MPROVE_CONFIG_FILENAME} file`,
                  lines: [
                    {
                      line: file[parameter + constants.LINE_NUM],
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
            enums.ParameterEnum.Udfs.toString(),
            enums.ParameterEnum.Fields.toString(),
            enums.ParameterEnum.Reports.toString(),
            enums.ParameterEnum.BuildMetrics.toString(),
            enums.ParameterEnum.SkipMetrics.toString(),
            enums.ParameterEnum.Rows.toString(),
            enums.ParameterEnum.Params.toString(),
            enums.ParameterEnum.Entries.toString(),
            enums.ParameterEnum.Headers.toString(),
            enums.ParameterEnum.Steps.toString(),
            enums.ParameterEnum.Joins.toString(),
            enums.ParameterEnum.AccessUsers.toString(),
            enums.ParameterEnum.AccessRoles.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: file[parameter + constants.LINE_NUM],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
          return;
        }

        if (file[parameter]?.constructor === Object) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: file[parameter + constants.LINE_NUM],
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
            enums.ParameterEnum.Udfs.toString(),
            enums.ParameterEnum.Fields.toString(),
            enums.ParameterEnum.Reports.toString(),
            enums.ParameterEnum.BuildMetrics.toString(),
            enums.ParameterEnum.SkipMetrics.toString(),
            enums.ParameterEnum.Rows.toString(),
            enums.ParameterEnum.Params.toString(),
            enums.ParameterEnum.Entries.toString(),
            enums.ParameterEnum.Headers.toString(),
            enums.ParameterEnum.Steps.toString(),
            enums.ParameterEnum.Joins.toString(),
            enums.ParameterEnum.AccessUsers.toString(),
            enums.ParameterEnum.AccessRoles.toString()
          ].indexOf(parameter) > -1
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.PARAMETER_IS_NOT_A_LIST,
              message: `parameter "${parameter}" must be a List`,
              lines: [
                {
                  line: file[parameter + constants.LINE_NUM],
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.FilesAny,
    newFilesAny
  );
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
