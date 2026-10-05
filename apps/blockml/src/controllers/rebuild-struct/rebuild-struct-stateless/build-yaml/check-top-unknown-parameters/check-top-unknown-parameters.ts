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
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';

const topLevelArrayParameters = [
  'parameters',
  'fields',
  'tiles',
  'build_metrics',
  'field_groups',
  'field_time_groups',
  'results',
  'rows',
  'access_roles',
  'folders',
  'tables'
] satisfies FileParameter[];

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
          (['path', 'ext', 'name'] satisfies FileParameter[]).some(
            candidate => candidate === parameter
          )
        ) {
          return;
        }

        switch (file.ext) {
          case '.store' satisfies FileExtension: {
            if (
              (
                [
                  'store',
                  'connection',
                  'label',
                  'space',
                  'access_roles',
                  'method',
                  'preset',
                  'request',
                  'response',
                  'date_range_includes_right_side',
                  'parameters',
                  'results',
                  'build_metrics',
                  'field_groups',
                  'field_time_groups',
                  'fields'
                ] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_STORE_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${'.store' satisfies FileExtension} file`,
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

          case '.dashboard' satisfies FileExtension: {
            if (
              (
                [
                  'dashboard',
                  'title',
                  'access_roles',
                  'parameters',
                  'tiles'
                ] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_DASHBOARD_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${'.dashboard' satisfies FileExtension} file`,
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

          case '.chart' satisfies FileExtension: {
            if (
              (
                ['chart', 'access_roles', 'tiles'] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_CHART_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${'.chart' satisfies FileExtension} file`,
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

          case '.report' satisfies FileExtension: {
            if (
              (
                [
                  'report',
                  'title',
                  'parameters',
                  'access_roles',
                  'options',
                  'rows'
                ] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_REPORT_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${'.report' satisfies FileExtension} file`,
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

          case '.schema' satisfies FileExtension: {
            if (
              (
                ['schema', 'description', 'tables'] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_SCHEMA_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${'.schema' satisfies FileExtension} file`,
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

          case '.yml' satisfies FileExtension: {
            if (
              (
                [
                  'mprove_dir',
                  'week_start',
                  'allow_timezones',
                  'format_number',
                  'currency_prefix',
                  'currency_suffix',
                  'thousands_separator',
                  'case_sensitive_string_filters'
                ] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
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

          case '.space' satisfies FileExtension: {
            if (
              (
                [
                  'space',
                  'title',
                  'access_roles',
                  'folders'
                ] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'UNKNOWN_SPACE_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used on top level of ` +
                    `${'.space' satisfies FileExtension} file`,
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
          topLevelArrayParameters.findIndex(
            candidate => candidate === parameter
          ) < 0
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
          (
            ['options', 'access_roles', 'folders'] satisfies FileParameter[]
          ).findIndex(candidate => candidate === parameter) < 0
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
          parameter === ('options' satisfies FileParameter) &&
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
          topLevelArrayParameters.some(candidate => candidate === parameter)
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
