import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { log } from '../extra/log';

let func = FuncEnum.CheckSpaceParents;

export function checkSpaceParents(
  item: {
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newSpaces: FilePartSpace[] = [];

  item.spaces.forEach(space => {
    let errorsOnStart = item.errors.length;
    let parts = space.space.split('.');
    parts.pop();

    while (parts.length > 0) {
      let parentSpaceName = parts.join('.');
      let parentSpace = item.spaces.find(x => x.space === parentSpaceName);
      let isParentSpaceDefined = isDefined(parentSpace);

      if (isParentSpaceDefined === false) {
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

  return newSpaces;
}
