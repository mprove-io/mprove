import type { SpaceFolder } from '#common/zod/backend/space-folder';
import type { Space } from '#common/zod/blockml/space';

export function makeSpaceFolder(item: {
  space: Space;
  title: string;
}): SpaceFolder {
  let { space, title } = item;

  return {
    type: 'spaceFolder',
    id: space.space,
    space: space.space,
    filePath: space.filePath,
    title: title,
    accessRoles: space.accessRoles,
    accessRolesCombined: space.accessRolesCombined,
    isSynthetic: false,
    children: []
  };
}
