import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

export function setSpaceFullTitleRecursive(item: {
  space: FilePartSpace;
  spaces: FilePartSpace[];
  parentFullTitle?: string;
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
    setSpaceFullTitleRecursive({
      space: child,
      spaces: spaces,
      parentFullTitle: space.fullTitle
    });
  });
}
