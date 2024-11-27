import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckTopUnknownParameters;

export function checkTopUnknownParameters(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): any[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            common.ParameterEnum.Path.toString(),
            common.ParameterEnum.Ext.toString(),
            common.ParameterEnum.Name.toString()
          ].indexOf(parameter) > -1
        ) {
          return;
        }

        switch (file.ext) {
          case common.FileExtensionEnum.Udf: {
            if (
              [
                common.ParameterEnum.Udf.toString(),
                common.ParameterEnum.Sql.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_UDF_PARAMETER,
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
                common.ParameterEnum.View.toString(),
                common.ParameterEnum.Connection.toString(),
                common.ParameterEnum.Label.toString(),
                common.ParameterEnum.Description.toString(),
                common.ParameterEnum.Udfs.toString(),
                common.ParameterEnum.Table.toString(),
                common.ParameterEnum.DerivedTable.toString(),
                common.ParameterEnum.Parameters.toString(),
                common.ParameterEnum.Fields.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_VIEW_PARAMETER,
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
                common.ParameterEnum.Model.toString(),
                common.ParameterEnum.Connection.toString(),
                common.ParameterEnum.Label.toString(),
                // common.ParameterEnum.Group.toString(),
                // common.ParameterEnum.Hidden.toString(),
                common.ParameterEnum.Description.toString(),
                common.ParameterEnum.AccessUsers.toString(),
                common.ParameterEnum.AccessRoles.toString(),
                common.ParameterEnum.AlwaysJoin.toString(),
                common.ParameterEnum.SqlAlwaysWhere.toString(),
                common.ParameterEnum.SqlAlwaysWhereCalc.toString(),
                common.ParameterEnum.Udfs.toString(),
                common.ParameterEnum.Joins.toString(),
                common.ParameterEnum.BuildMetrics.toString(),
                common.ParameterEnum.Parameters.toString(),
                common.ParameterEnum.Fields.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_MODEL_PARAMETER,
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
                common.ParameterEnum.Dashboard.toString(),
                common.ParameterEnum.Title.toString(),
                // common.ParameterEnum.Group.toString(),
                // common.ParameterEnum.Hidden.toString(),
                common.ParameterEnum.Description.toString(),
                common.ParameterEnum.AccessUsers.toString(),
                common.ParameterEnum.AccessRoles.toString(),
                common.ParameterEnum.Parameters.toString(),
                common.ParameterEnum.Tiles.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_DASHBOARD_PARAMETER,
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

          case common.FileExtensionEnum.Chart: {
            if (
              [
                common.ParameterEnum.Chart.toString(),
                // common.ParameterEnum.Group.toString(),
                // common.ParameterEnum.Hidden.toString(),
                common.ParameterEnum.AccessUsers.toString(),
                common.ParameterEnum.AccessRoles.toString(),
                common.ParameterEnum.Tiles.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_CHART_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Chart} file`,
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

          case common.FileExtensionEnum.Report: {
            if (
              [
                common.ParameterEnum.Report.toString(),
                common.ParameterEnum.Title.toString(),
                common.ParameterEnum.AccessUsers.toString(),
                common.ParameterEnum.AccessRoles.toString(),
                common.ParameterEnum.Rows.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_REPORT_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used on top level of ` +
                    `${common.FileExtensionEnum.Report} file`,
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
                common.ParameterEnum.Api.toString(),
                common.ParameterEnum.Label.toString(),
                common.ParameterEnum.Https.toString(),
                common.ParameterEnum.Host.toString(),
                common.ParameterEnum.Headers.toString(),
                common.ParameterEnum.Steps.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_API_PARAMETER,
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
                common.ParameterEnum.Metric.toString(),
                common.ParameterEnum.Type.toString(),
                common.ParameterEnum.Label.toString(),
                common.ParameterEnum.TimeSpec.toString(),
                common.ParameterEnum.Model.toString(),
                common.ParameterEnum.Time.toString(),
                common.ParameterEnum.Field.toString(),
                common.ParameterEnum.Api.toString(),
                common.ParameterEnum.Formula.toString(),
                common.ParameterEnum.Sql.toString(),
                common.ParameterEnum.Connection.toString(),
                common.ParameterEnum.Description.toString(),
                common.ParameterEnum.Params.toString(),
                common.ParameterEnum.Entries.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_METRIC_PARAMETER,
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
                common.ParameterEnum.MproveDir.toString(),
                common.ParameterEnum.WeekStart.toString(),
                common.ParameterEnum.DefaultTimezone.toString(),
                common.ParameterEnum.AllowTimezones.toString(),
                common.ParameterEnum.FormatNumber.toString(),
                common.ParameterEnum.CurrencyPrefix.toString(),
                common.ParameterEnum.CurrencySuffix.toString(),
                common.ParameterEnum.CaseSensitiveStringFilters.toString(),
                common.ParameterEnum.SimplifySafeAggregates.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_MPROVE_CONFIG_PARAMETER,
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
            common.ParameterEnum.Udfs.toString(),
            common.ParameterEnum.Parameters.toString(),
            common.ParameterEnum.Fields.toString(),
            common.ParameterEnum.Tiles.toString(),
            common.ParameterEnum.BuildMetrics.toString(),
            common.ParameterEnum.Rows.toString(),
            common.ParameterEnum.Params.toString(),
            common.ParameterEnum.Entries.toString(),
            common.ParameterEnum.Headers.toString(),
            common.ParameterEnum.Steps.toString(),
            common.ParameterEnum.Joins.toString(),
            common.ParameterEnum.AccessUsers.toString(),
            common.ParameterEnum.AccessRoles.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_LIST,
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
              title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
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
            common.ParameterEnum.Udfs.toString(),
            common.ParameterEnum.Parameters.toString(),
            common.ParameterEnum.Fields.toString(),
            common.ParameterEnum.Tiles.toString(),
            common.ParameterEnum.BuildMetrics.toString(),
            common.ParameterEnum.Rows.toString(),
            common.ParameterEnum.Params.toString(),
            common.ParameterEnum.Entries.toString(),
            common.ParameterEnum.Headers.toString(),
            common.ParameterEnum.Steps.toString(),
            common.ParameterEnum.Joins.toString(),
            common.ParameterEnum.AccessUsers.toString(),
            common.ParameterEnum.AccessRoles.toString()
          ].indexOf(parameter) > -1
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.PARAMETER_IS_NOT_A_LIST,
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
    common.LogTypeEnum.FilesAny,
    newFilesAny
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );

  return newFilesAny;
}
