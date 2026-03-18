import { ConfigService } from '@nestjs/config';
import { formatSpecifier } from 'd3-format';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_CONFIG_FILENAME,
  PROJECT_CONFIG_ALLOW_TIMEZONES,
  PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
  PROJECT_CONFIG_CURRENCY_PREFIX,
  PROJECT_CONFIG_CURRENCY_SUFFIX,
  PROJECT_CONFIG_DEFAULT_TIMEZONE,
  PROJECT_CONFIG_FORMAT_NUMBER,
  PROJECT_CONFIG_THOUSANDS_SEPARATOR,
  PROJECT_CONFIG_WEEK_START,
  PROJECT_WEEK_START_VALUES
} from '#common/constants/top';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isTimezoneValid } from '#common/functions/is-timezone-valid';
import { isUndefined } from '#common/functions/is-undefined';
import { FileProjectConf } from '#common/interfaces/blockml/internal/file-project-conf';
import { MyRegex } from '#common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckProjectConfig;

export function checkProjectConfig(
  item: {
    confs: FileProjectConf[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
    mproveDir: string;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  let projectConfig: FileProjectConf = {
    allow_timezones: PROJECT_CONFIG_ALLOW_TIMEZONES,
    default_timezone: PROJECT_CONFIG_DEFAULT_TIMEZONE,
    week_start: PROJECT_CONFIG_WEEK_START,
    currency_prefix: PROJECT_CONFIG_CURRENCY_PREFIX,
    currency_suffix: PROJECT_CONFIG_CURRENCY_SUFFIX,
    format_number: PROJECT_CONFIG_FORMAT_NUMBER,
    thousands_separator: PROJECT_CONFIG_THOUSANDS_SEPARATOR,
    case_sensitive_string_filters: PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined
  };

  if (item.confs.length === 1) {
    let conf = item.confs[0];

    let parameters = Object.keys(conf).filter(
      x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM())
    );

    if (parameters.indexOf(ParameterEnum.MproveDir.toString()) < 0) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_MPROVE_DIR,
          message: `parameter "${ParameterEnum.MproveDir}" must be specified`,
          lines: [
            {
              line: 0,
              name: conf.fileName,
              path: conf.filePath
            }
          ]
        })
      );
    } else {
      let mdir = conf[ParameterEnum.MproveDir].toString();

      if (mdir.length <= 2 && mdir !== MPROVE_CONFIG_DIR_DOT_SLASH) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MPROVE_DIR_MUST_START_WITH_DOT_SLASH,
            message: `${ParameterEnum.MproveDir} must start with "./"`,
            lines: [
              {
                line: conf.mprove_dir_line_num,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );
      } else if (
        mdir.length > 2 &&
        mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
      ) {
        mdir = mdir.substring(2);

        if (mdir.match(MyRegex.CONTAINS_DOT())) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MPROVE_DIR_HAS_DOT_AFTER_SLASH,
              message: `${ParameterEnum.MproveDir} must not have "." after "/"`,
              lines: [
                {
                  line: conf.mprove_dir_line_num,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );
        } else if (isUndefined(item.mproveDir)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MPROVE_DIR_PATH_DOES_NOT_EXIST,
              message: `path "${mdir}" does not exist or is not a directory`,
              lines: [
                {
                  line: conf.mprove_dir_line_num,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );
        }
      }
    }

    parameters.forEach(parameter => {
      if (
        [
          ParameterEnum.Path.toString(),
          ParameterEnum.Ext.toString(),
          ParameterEnum.Name.toString()
        ].indexOf(parameter) > -1
      ) {
        return;
      }

      if (
        [
          ParameterEnum.AllowTimezones.toString(),
          ParameterEnum.CaseSensitiveStringFilters.toString()
        ].indexOf(parameter) > -1 &&
        !conf[parameter as keyof FileProjectConf]
          .toString()
          .match(MyRegex.TRUE_FALSE())
      ) {
        item.errors.push(
          new BmError({
            title:
              parameter === ParameterEnum.AllowTimezones.toString()
                ? ErTitleEnum.WRONG_ALLOW_TIMEZONES
                : parameter ===
                    ParameterEnum.CaseSensitiveStringFilters.toString()
                  ? ErTitleEnum.WRONG_CASE_SENSITIVE_STRING_FILTERS
                  : ErTitleEnum.WRONG_PROJECT_CONFIG_PARAMETER,

            message: `parameter "${parameter}:" must be "true" or "false" if specified`,
            lines: [
              {
                line: conf[
                  (parameter + LINE_NUM) as keyof FileProjectConf
                ] as number,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );

        return;
      }

      if (parameter === ParameterEnum.WeekStart.toString()) {
        let lowerCaseWeekStart = conf.week_start.toLowerCase();

        (<any>conf).week_start = capitalizeFirstLetter(lowerCaseWeekStart);

        if (
          PROJECT_WEEK_START_VALUES.map(x => x.toString()).indexOf(
            conf[parameter as keyof FileProjectConf].toString()
          ) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_WEEK_START,
              message: `parameter "${parameter}:" must be "Sunday" or "Monday" if specified`,
              lines: [
                {
                  line: conf[
                    (parameter + LINE_NUM) as keyof FileProjectConf
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );

          return;
        }
      }

      if (
        parameter === ParameterEnum.DefaultTimezone.toString() &&
        isTimezoneValid(conf[parameter as keyof FileProjectConf].toString()) ===
          false
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_DEFAULT_TIMEZONE,
            message: `wrong ${ParameterEnum.DefaultTimezone} value`,
            lines: [
              {
                line: conf[
                  (parameter + LINE_NUM) as keyof FileProjectConf
                ] as number,
                name: conf.fileName,
                path: conf.filePath
              }
            ]
          })
        );

        return;
      }

      if (parameter === ParameterEnum.FormatNumber.toString()) {
        let value = conf[parameter as keyof FileProjectConf].toString();
        try {
          formatSpecifier(value);
        } catch (e) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_FORMAT_NUMBER,
              message: ` ${ParameterEnum.FormatNumber} value "${value}" is not valid`,
              lines: [
                {
                  line: conf[
                    (parameter + LINE_NUM) as keyof FileProjectConf
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );
          return;
        }
      }
    });

    projectConfig = Object.assign(projectConfig, conf);
  } else if (
    item.confs.length === 0 &&
    item.errors
      .map(e => e.lines)
      .reduce((a, b) => a.concat(b), [])
      .findIndex(line => line.name === MPROVE_CONFIG_FILENAME) < 0
  ) {
    item.errors.push(
      new BmError({
        title: ErTitleEnum.MPROVE_CONFIG_NOT_FOUND,
        message: `project must have ./${MPROVE_CONFIG_FILENAME} file`,
        lines: []
      })
    );

    return;
  } else {
    // item.confs.length > 1
    // already checked by "duplicate file names" and "wrong extension"
  }

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(
    cs,
    caller,
    func,
    structId,
    LogTypeEnum.ProjectConf,
    errorsOnStart === item.errors.length ? projectConfig : ''
  );

  return errorsOnStart === item.errors.length ? projectConfig : undefined;
}
