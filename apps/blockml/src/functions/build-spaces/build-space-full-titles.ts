import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { log } from '../extra/log';

let func = FuncEnum.BuildSpaceFullTitles;

export function buildSpaceFullTitles(
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

  item.spaces.forEach(space => {
    let parts = space.space.split('.');
    let isRootSpace = parts.length === 1;

    if (isRootSpace) {
      setSpaceFullTitle({
        space: space,
        spaces: item.spaces,
        parentFullTitle: undefined
      });
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Spaces, item.spaces);

  return item.spaces;
}

function setSpaceFullTitle(item: {
  space: FilePartSpace;
  spaces: FilePartSpace[];
  parentFullTitle: string | undefined;
}) {
  let { space, spaces, parentFullTitle } = item;

  let parts = space.space.split('.');
  let title = capitalizeFirstLetter(space.title || parts[parts.length - 1]);

  space.fullTitle = isDefined(parentFullTitle)
    ? `${parentFullTitle} - ${title}`
    : title;

  let children = spaces.filter(x => {
    let childParts = x.space.split('.');
    let parentSpace = childParts.slice(0, childParts.length - 1).join('.');

    return (
      childParts.length === parts.length + 1 && parentSpace === space.space
    );
  });

  children.forEach(child => {
    setSpaceFullTitle({
      space: child,
      spaces: spaces,
      parentFullTitle: space.fullTitle
    });
  });
}
