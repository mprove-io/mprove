import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import { checkSpaceFolderValuesRecursive } from './check-space-folder-values-recursive/check-space-folder-values-recursive';

let func: Func = 'build-yaml/check-top-values';

export function checkTopValues(item: {
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

        if (
          (
            [
              'model',
              'mod',
              'store',
              'report',
              'dashboard',
              'chart'
            ] satisfies FileParameter[]
          ).some(candidate => candidate === parameter) &&
          file[parameter]
            .toString()
            .match(MyRegex.CAPTURE_NOT_ALLOWED_FILE_DECLARATION_CHARS_G())
        ) {
          item.errors.push(
            new BmError({
              title: 'WRONG_CHARS_IN_PARAMETER_VALUE',
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
          ('space' satisfies FileParameter) === parameter &&
          file.ext !== ('.space' satisfies FileExtension) &&
          !file[parameter].toString().match(/^[a-z][a-z0-9_.]*$/)
        ) {
          item.errors.push(
            new BmError({
              title: 'WRONG_CHARS_IN_PARAMETER_VALUE',
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
          ('space' satisfies FileParameter) === parameter &&
          file.ext === ('.space' satisfies FileExtension) &&
          !file[parameter].toString().match(/^[a-z][a-z0-9_]*$/)
        ) {
          item.errors.push(
            new BmError({
              title: 'WRONG_CHARS_IN_PARAMETER_VALUE',
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

    if (file.ext === ('.space' satisfies FileExtension)) {
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

  log(cs, caller, func, structId, 'out_filesAny.log', newFilesAny);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(newFilesAny);
}
