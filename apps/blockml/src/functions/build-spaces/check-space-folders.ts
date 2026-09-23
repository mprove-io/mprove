import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { log } from '../extra/log';
import { checkSpaceFolderElementsRecursive } from './check-space-folder-elements-recursive';

let func = FuncEnum.CheckSpaceFolders;

export function checkSpaceFolders(item: {
  spaces: FileSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, logItem);

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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Spaces, newSpaces);

  return Result.succeed(newSpaces);
}
