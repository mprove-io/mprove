import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { MyRegex } from '#common/classes/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { log } from '../extra/log';
import { checkSpaceFolderValuesRecursive } from './check-space-folder-values-recursive';

let func = FuncEnum.CheckTopValues;

export function checkTopValues(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<any[], never> {
  let { caller, structId, cs } = item;
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

        if (
          ParameterEnum.Space.toString() === parameter &&
          file.ext !== FileExtensionEnum.Space &&
          !file[parameter].toString().match(/^[a-z][a-z0-9_.]*$/)
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_PARAMETER_VALUE,
              message: `parameter "${parameter}" contains wrong characters or whitespace (only "a...z0...9_." is allowed and must start with a letter)`,
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
          ParameterEnum.Space.toString() === parameter &&
          file.ext === FileExtensionEnum.Space &&
          !file[parameter].toString().match(/^[a-z][a-z0-9_]*$/)
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHARS_IN_PARAMETER_VALUE,
              message: `parameter "${parameter}" contains wrong characters or whitespace (only "a...z0...9_" is allowed and must start with a letter)`,
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

    if (file.ext === FileExtensionEnum.Space) {
      checkSpaceFolderValuesRecursive({
        file: file,
        rootFile: file,
        errors: item.errors
      });
    }

    if (errorsOnStart === item.errors.length) {
      newFilesAny.push(file);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return Result.succeed(newFilesAny);
}
