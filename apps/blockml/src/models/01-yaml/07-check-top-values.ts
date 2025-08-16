import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckTopValues;

export function checkTopValues(
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

        if (
          parameter === common.ParameterEnum.Hidden.toString() &&
          !file[parameter].toString().match(common.MyRegex.TRUE_FALSE())
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_HIDDEN,
              message:
                'parameter "hidden:" must be "true" or "false" if specified',
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
          [
            common.ParameterEnum.Model.toString(),
            common.ParameterEnum.Mod.toString(),
            common.ParameterEnum.Store.toString(),
            common.ParameterEnum.Report.toString(),
            common.ParameterEnum.Dashboard.toString(),
            common.ParameterEnum.Chart.toString()
          ].indexOf(parameter) > -1 &&
          file[parameter]
            .toString()
            .match(
              common.MyRegex.CAPTURE_NOT_ALLOWED_FILE_DECLARATION_CHARS_G()
            )
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_CHARS_IN_PARAMETER_VALUE,
              message: `parameter "${parameter}" contains wrong characters or whitespace (only snake_case "a...zA...Z0...9_" is allowed)`,
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
