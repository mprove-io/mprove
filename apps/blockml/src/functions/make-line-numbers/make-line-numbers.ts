import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/extra/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { processLineNumbersRecursive } from './process-line-numbers-recursive/process-line-numbers-recursive';

let func = FuncEnum.MakeLineNumbers;

export function makeLineNumbers(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  isSetLineNumToZero?: boolean;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<any[], never> {
  let { caller, structId, isSetLineNumToZero, cs } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.map(element => {
    let errorsOnStart = item.errors.length;
    processLineNumbersRecursive({
      hash: element,
      fileName: element.name,
      filePath: element.path,
      errors: item.errors,
      isSetLineNumToZero: isSetLineNumToZero
    });

    if (errorsOnStart === item.errors.length) {
      newFilesAny.push(element);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return Result.succeed(newFilesAny);
}
