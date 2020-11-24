import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.CheckTopUnknownParameters;

export function checkTopUnknownParameters(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}): any[] {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM()))
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
          case api.FileExtensionEnum.Udf: {
            if (
              [
                enums.ParameterEnum.Udf.toString(),
                enums.ParameterEnum.Sql.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_UDF_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .udf file`,
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

          case api.FileExtensionEnum.View: {
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
                  message: `parameter "${parameter}" can not be used on top level of .view file`,
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

          case api.FileExtensionEnum.Model: {
            if (
              [
                enums.ParameterEnum.Model.toString(),
                enums.ParameterEnum.Connection.toString(),
                enums.ParameterEnum.Hidden.toString(),
                enums.ParameterEnum.Label.toString(),
                enums.ParameterEnum.Group.toString(),
                enums.ParameterEnum.Description.toString(),
                enums.ParameterEnum.AccessUsers.toString(),
                enums.ParameterEnum.AlwaysJoin.toString(),
                enums.ParameterEnum.SqlAlwaysWhere.toString(),
                enums.ParameterEnum.SqlAlwaysWhereCalc.toString(),
                enums.ParameterEnum.Udfs.toString(),
                enums.ParameterEnum.Joins.toString(),
                enums.ParameterEnum.Fields.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_MODEL_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .model file`,
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

          case api.FileExtensionEnum.Dashboard: {
            if (
              [
                enums.ParameterEnum.Dashboard.toString(),
                enums.ParameterEnum.Title.toString(),
                enums.ParameterEnum.Group.toString(),
                enums.ParameterEnum.Hidden.toString(),
                enums.ParameterEnum.Description.toString(),
                enums.ParameterEnum.AccessUsers.toString(),
                enums.ParameterEnum.Fields.toString(),
                enums.ParameterEnum.Reports.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_DASHBOARD_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .dashboard file`,
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
            enums.ParameterEnum.Joins.toString(),
            enums.ParameterEnum.AccessUsers.toString()
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
        } else if (
          !!file[parameter] &&
          file[parameter].constructor === Object
        ) {
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
            enums.ParameterEnum.Joins.toString(),
            enums.ParameterEnum.AccessUsers.toString()
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

  helper.log(caller, func, structId, enums.LogTypeEnum.FilesAny, newFilesAny);
  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
