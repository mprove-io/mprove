import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import { processLineNumbersRecursive } from './process-line-numbers-recursive/process-line-numbers-recursive';

let func: Func = 'build-yaml/make-line-numbers';

export function makeLineNumbers(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  isSetLineNumToZero?: boolean;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<any[], never> {
  let { caller, structId, isSetLineNumToZero, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

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

  log(cs, caller, func, structId, 'out_filesAny.log', newFilesAny);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(newFilesAny);
}
