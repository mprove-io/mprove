import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckProjectConfig;

export function checkProjectConfig(
  item: {
    confs: interfaces.Conf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  let projectConf: interfaces.Conf;

  if (item.confs.length === 0) {
    projectConf = {
      allow_timezones: true,
      default_timezone: common.UTC,
      week_start: common.ProjectWeekStartEnum.Sunday,
      fileName: undefined,
      fileExt: undefined,
      filePath: undefined,
      name: undefined
    };
  } else if (item.confs.length > 1) {
    // already checked by "duplicate file names" and "wrong extension"
  } else {
    projectConf = item.confs[0];

    Object.keys(projectConf)
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
          !projectConf[parameter].toString().match(common.MyRegex.TRUE_FALSE())
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_ALLOW_TIMEZONES,
              message: `parameter "${parameter}:" must be "true" or "false" if specified`,
              lines: [
                {
                  line: projectConf[parameter + constants.LINE_NUM],
                  name: projectConf.fileName,
                  path: projectConf.filePath
                }
              ]
            })
          );

          return;
        }

        if (
          parameter === enums.ParameterEnum.WeekStart.toString() &&
          [
            common.ProjectWeekStartEnum.Sunday,
            common.ProjectWeekStartEnum.Monday
          ].indexOf(projectConf[parameter].toString().toLowerCase()) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_WEEK_START,
              message: `parameter "${parameter}:" must be "Sunday" or "Monday" if specified`,
              lines: [
                {
                  line: projectConf[parameter + constants.LINE_NUM],
                  name: projectConf.fileName,
                  path: projectConf.filePath
                }
              ]
            })
          );

          return;
        }

        if (
          parameter === enums.ParameterEnum.DefaultTimezone.toString() &&
          helper.isTimezoneValid(projectConf[parameter].toString()) === false
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_DEFAULT_TIMEZONE,
              message: `wrong ${enums.ParameterEnum.DefaultTimezone} value`,
              lines: [
                {
                  line: projectConf[parameter + constants.LINE_NUM],
                  name: projectConf.fileName,
                  path: projectConf.filePath
                }
              ]
            })
          );

          return;
        }
      });
  }

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.ProjectConf,
    common.isDefined(projectConf) ? projectConf : ''
  );

  return errorsOnStart === item.errors.length ? projectConf : undefined;
}
