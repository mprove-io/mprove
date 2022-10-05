import { ConfigService } from '@nestjs/config';
import { formatSpecifier } from 'd3-format';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckProjectConfig;

export function checkProjectConfig(
  item: {
    confs: interfaces.ProjectConf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  let projectConfig: interfaces.ProjectConf = {
    mprove_dir: common.MPROVE_CONFIG_DIR_DOT,
    allow_timezones: constants.PROJECT_CONFIG_ALLOW_TIMEZONES,
    default_timezone: constants.PROJECT_CONFIG_DEFAULT_TIMEZONE,
    week_start: constants.PROJECT_CONFIG_WEEK_START,
    currency_prefix: constants.PROJECT_CONFIG_CURRENCY_PREFIX,
    currency_suffix: constants.PROJECT_CONFIG_CURRENCY_SUFFIX,
    format_number: constants.PROJECT_CONFIG_FORMAT_NUMBER,
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined
  };

  if (item.confs.length === 1) {
    let conf = item.confs[0];

    Object.keys(conf)
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

        if (
          parameter === enums.ParameterEnum.AllowTimezones.toString() &&
          !conf[parameter as keyof interfaces.ProjectConf]
            .toString()
            .match(common.MyRegex.TRUE_FALSE())
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_ALLOW_TIMEZONES,
              message: `parameter "${parameter}:" must be "true" or "false" if specified`,
              lines: [
                {
                  line: conf[
                    (parameter +
                      constants.LINE_NUM) as keyof interfaces.ProjectConf
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );

          return;
        }

        if (parameter === enums.ParameterEnum.WeekStart.toString()) {
          (<any>conf).week_start = conf.week_start.toLowerCase();

          if (
            [
              common.ProjectWeekStartEnum.Sunday.toString(),
              common.ProjectWeekStartEnum.Monday.toString()
            ].indexOf(
              conf[parameter as keyof interfaces.ProjectConf].toString()
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_WEEK_START,
                message: `parameter "${parameter}:" must be "Sunday" or "Monday" if specified`,
                lines: [
                  {
                    line: conf[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ProjectConf
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
          parameter === enums.ParameterEnum.DefaultTimezone.toString() &&
          helper.isTimezoneValid(
            conf[parameter as keyof interfaces.ProjectConf].toString()
          ) === false
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_DEFAULT_TIMEZONE,
              message: `wrong ${enums.ParameterEnum.DefaultTimezone} value`,
              lines: [
                {
                  line: conf[
                    (parameter +
                      constants.LINE_NUM) as keyof interfaces.ProjectConf
                  ] as number,
                  name: conf.fileName,
                  path: conf.filePath
                }
              ]
            })
          );

          return;
        }

        if (parameter === enums.ParameterEnum.FormatNumber.toString()) {
          let value = conf[
            parameter as keyof interfaces.ProjectConf
          ].toString();
          try {
            formatSpecifier(value);
          } catch (e) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_FORMAT_NUMBER,
                message: ` ${enums.ParameterEnum.FormatNumber} value "${value}" is not valid`,
                lines: [
                  {
                    line: conf[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ProjectConf
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
  } else if (item.confs.length === 0) {
    item.errors.push(
      new BmError({
        title: enums.ErTitleEnum.MPROVE_CONFIG_NOT_FOUND,
        message: `project must have ./${common.MPROVE_CONFIG_FILENAME} file`,
        lines: []
      })
    );

    return;
  } else {
    // item.confs.length > 1
    // already checked by "duplicate file names" and "wrong extension"
  }

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.ProjectConf,
    errorsOnStart === item.errors.length ? projectConfig : ''
  );

  return errorsOnStart === item.errors.length ? projectConfig : undefined;
}
