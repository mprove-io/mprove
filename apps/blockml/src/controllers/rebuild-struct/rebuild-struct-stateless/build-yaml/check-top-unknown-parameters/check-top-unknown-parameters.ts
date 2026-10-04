import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import { LINE_NUM } from '#common/constants/top-blockml';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

let func: Func = 'build-yaml/check-top-unknown-parameters';

export function checkTopUnknownParameters(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<any[], never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          ['path'.toString(), 'ext'.toString(), 'name'.toString()].indexOf(
            parameter
          ) > -1
        ) {
          return;
        }

        switch (file.ext) {
          case '.store': {
            if (
              [
                'store'.toString(),
                'connection'.toString(),
                'label'.toString(),
                'space'.toString(),
                'access_roles'.toString(),
                'method'.toString(),
                'preset'.toString(),
                'request'.toString(),
                'response'.toString(),
                'date_range_includes_right_side'.toString(),
                'parameters'.toString(),
                'results'.toString(),
                'build_metrics'.toString(),
                'field_groups'.toString(),
                'field_time_groups'.toString(),
                'fields'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_STORE_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `.store file`,
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

          case '.dashboard': {
            if (
              [
                'dashboard'.toString(),
                'title'.toString(),
                'access_roles'.toString(),
                'parameters'.toString(),
                'tiles'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_DASHBOARD_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `.dashboard file`,
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

          case '.chart': {
            if (
              [
                'chart'.toString(),
                'access_roles'.toString(),
                'tiles'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_CHART_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `.chart file`,
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

          case '.report': {
            if (
              [
                'report'.toString(),
                'title'.toString(),
                'parameters'.toString(),
                'access_roles'.toString(),
                'options'.toString(),
                'rows'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_REPORT_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `.report file`,
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

          case '.schema': {
            if (
              [
                'schema'.toString(),
                'description'.toString(),
                'tables'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_SCHEMA_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `.schema file`,
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

          case '.yml': {
            if (
              [
                'mprove_dir'.toString(),
                'week_start'.toString(),
                // ParameterEnum.DefaultTimezone.toString(),
                'allow_timezones'.toString(),
                'format_number'.toString(),
                'currency_prefix'.toString(),
                'currency_suffix'.toString(),
                'thousands_separator'.toString(),
                'case_sensitive_string_filters'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_MPROVE_CONFIG_PARAMETER',
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

          case '.space': {
            if (
              [
                'space'.toString(),
                'title'.toString(),
                'access_roles'.toString(),
                'folders'.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_SPACE_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `.space file`,
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
            'parameters'.toString(),
            'fields'.toString(),
            'tiles'.toString(),
            'build_metrics'.toString(),
            'field_groups'.toString(),
            'field_time_groups'.toString(),
            'results'.toString(),
            'rows'.toString(),
            'access_roles'.toString(),
            'folders'.toString(),
            'tables'.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'UNEXPECTED_LIST',
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
          [
            'options'.toString(),
            'access_roles'.toString(),
            'folders'.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'UNEXPECTED_DICTIONARY',
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
          ['options'.toString()].indexOf(parameter) > -1 &&
          file[parameter]?.constructor !== Object
        ) {
          item.errors.push(
            new BmError({
              title: 'PARAMETER_IS_NOT_A_DICTIONARY',
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
            'parameters'.toString(),
            'fields'.toString(),
            'tiles'.toString(),
            'build_metrics'.toString(),
            'field_groups'.toString(),
            'field_time_groups'.toString(),
            'results'.toString(),
            'rows'.toString(),
            'access_roles'.toString(),
            'folders'.toString(),
            'tables'.toString()
          ].indexOf(parameter) > -1
        ) {
          item.errors.push(
            new BmError({
              title: 'PARAMETER_IS_NOT_A_LIST',
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

  log(cs, caller, func, structId, 'out_filesAny.log', newFilesAny);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(newFilesAny);
}
