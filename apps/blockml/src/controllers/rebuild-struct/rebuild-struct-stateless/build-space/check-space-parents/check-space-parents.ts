import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

let func = FuncEnum.CheckSpaceParents;

export function checkSpaceParents(item: {
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, logItem);

  let newSpaces: FilePartSpace[] = [];

  item.spaces.forEach(space => {
    let errorsOnStart = item.errors.length;

    let parts: string[] = space.space.split('.');

    parts.pop();

    while (parts.length > 0) {
      let parentSpaceName: string = parts.join('.');

      let parentSpace: FilePartSpace = item.spaces.find(
        x => x.space === parentSpaceName
      );

      if (isUndefined(parentSpace)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.SPACE_PARENT_DOES_NOT_EXIST,
            message: `space "${space.space}" requires parent space "${parentSpaceName}"`,
            lines: [
              {
                line: space.space_line_num,
                name: space.fileName,
                path: space.filePath
              }
            ]
          })
        );
      }

      parts.pop();
    }

    if (errorsOnStart === item.errors.length) {
      newSpaces.push(space);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Spaces, newSpaces);

  return Result.succeed(newSpaces);
}
