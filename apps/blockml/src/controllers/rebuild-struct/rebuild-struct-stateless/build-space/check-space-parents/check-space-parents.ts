import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';

let func: Func = 'build-spaces/check-space-parents';

export function checkSpaceParents(item: {
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', logItem);

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
            title: 'SPACE_PARENT_DOES_NOT_EXIST',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_spaces.log', newSpaces);

  return Result.succeed(newSpaces);
}
