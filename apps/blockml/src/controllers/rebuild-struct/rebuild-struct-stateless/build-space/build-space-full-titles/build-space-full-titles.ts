import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import { setSpaceFullTitleRecursive } from './set-space-full-title-recursive/set-space-full-title-recursive';

let func: Func = 'build-spaces/build-space-full-titles';

export function buildSpaceFullTitles(item: {
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', logItem);

  item.spaces.forEach(space => {
    let parts: string[] = space.space.split('.');
    let isRootSpace = parts.length === 1;

    if (isRootSpace) {
      setSpaceFullTitleRecursive({
        space: space,
        spaces: item.spaces
      });
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_spaces.log', item.spaces);

  return Result.succeed(item.spaces);
}
