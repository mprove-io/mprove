import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileSpace } from '#common/types/blockml/parts/internal/file-space';
import { checkSpaceFolderElementsRecursive } from './check-space-folder-elements-recursive/check-space-folder-elements-recursive';

let func: Func = 'build-spaces/check-space-folders';

export function checkSpaceFolders(item: {
  spaces: FileSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', logItem);

  let newSpaces: FileSpace[] = [];

  item.spaces.forEach(space => {
    let errorsOnStart = item.errors.length;

    if (Array.isArray(space.folders)) {
      checkSpaceFolderElementsRecursive({
        file: space,
        folders: space.folders,
        errors: item.errors
      });
    }

    if (errorsOnStart === item.errors.length) {
      newSpaces.push(space);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_spaces.log', newSpaces);

  return Result.succeed(newSpaces);
}
