import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';

let logPack = '1-yaml';
let logFolder = '6-check-top-unknown-parameters';

export function checkTopUnknownParameters(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
}): any[] {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.Input, item);

  let filesAny = item.filesAny;

  filesAny.forEach(file => {
    Object.keys(file)
      .filter(x => !x.toString().match(api.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (['path', 'ext', 'name'].indexOf(parameter) > -1) {
          return;
        }

        switch (file.ext) {
          case '.udf': {
            if (['udf', 'sql'].indexOf(parameter) < 0) {
              // error e209
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_UDF_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .udf file`,
                  lines: [
                    {
                      line: file[parameter + '_line_num'],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );

              delete file[parameter];
              delete file[parameter + '_line_num'];
              return;
            }
            break;
          }

          case '.view': {
            if (
              [
                'view',
                'label',
                'description',
                'udfs',
                'table',
                'derived_table',
                'permanent',
                'pdt_trigger_time',
                'pdt_trigger_sql',
                'fields'
              ].indexOf(parameter) < 0
            ) {
              // error e116
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_VIEW_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .view file`,
                  lines: [
                    {
                      line: file[parameter + '_line_num'],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );

              delete file[parameter];
              delete file[parameter + '_line_num'];
              return;
            }
            break;
          }

          case '.model': {
            if (
              [
                'model',
                'hidden',
                'label',
                'group',
                'description',
                'access_users',
                'always_join',
                'sql_always_where',
                'sql_always_where_calc',
                'udfs',
                'joins',
                'fields'
              ].indexOf(parameter) < 0
            ) {
              // error e117
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_MODEL_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .model file`,
                  lines: [
                    {
                      line: file[parameter + '_line_num'],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );

              delete file[parameter];
              delete file[parameter + '_line_num'];
              return;
            }
            break;
          }

          case '.dashboard': {
            if (
              [
                'dashboard',
                'title',
                'group',
                'hidden',
                'description',
                'access_users',
                'fields',
                'reports'
              ].indexOf(parameter) < 0
            ) {
              // error e118
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.UNKNOWN_DASHBOARD_PARAMETER,
                  message: `parameter "${parameter}" can not be used on top level of .dashboard file`,
                  lines: [
                    {
                      line: file[parameter + '_line_num'],
                      name: file.name,
                      path: file.path
                    }
                  ]
                })
              );

              delete file[parameter];
              delete file[parameter + '_line_num'];
              return;
            }
            break;
          }
        }

        if (
          Array.isArray(file[parameter]) &&
          ['udfs', 'fields', 'reports', 'joins', 'access_users'].indexOf(
            parameter
          ) < 0
        ) {
          // error e120
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: file[parameter + '_line_num'],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );

          delete file[parameter];
          delete file[parameter + '_line_num'];
          return;
        } else if (
          !!file[parameter] &&
          file[parameter].constructor === Object
        ) {
          // error e121
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: file[parameter + '_line_num'],
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );

          delete file[parameter];
          delete file[parameter + '_line_num'];
          return;
        }
      });
  });

  helper.log(logId, logPack, logFolder, enums.LogEnum.FilesAny, filesAny);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);

  return filesAny;
}
