import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/extra/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { setSpaceFullTitleRecursive } from './set-space-full-title-recursive/set-space-full-title-recursive';

let func = FuncEnum.BuildSpaceFullTitles;

export function buildSpaceFullTitles(item: {
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, logItem);

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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Spaces, item.spaces);

  return Result.succeed(item.spaces);
}
