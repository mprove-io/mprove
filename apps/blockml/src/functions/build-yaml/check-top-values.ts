import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { MyRegex } from '#common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckTopValues;

export function checkTopValues(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): any[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.forEach(file => {
    let errorsOnStart = item.errors.length;

    Object.keys(file)
      .filter(x => !x.toString().match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
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
            ParameterEnum.Model.toString(),
            ParameterEnum.Mod.toString(),
            ParameterEnum.Store.toString(),
            ParameterEnum.Report.toString(),
            ParameterEnum.Dashboard.toString(),
            ParameterEnum.Chart.toString()
          ].indexOf(parameter) > -1 &&
          file[parameter]
            .toString()
            .match(MyRegex.CAPTURE_NOT_ALLOWED_FILE_DECLARATION_CHARS_G())
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_PARAMETER_VALUE,
              message: `parameter "${parameter}" contains wrong characters or whitespace (only snake_case "a...zA...Z0...9_" is allowed)`,
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

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}
