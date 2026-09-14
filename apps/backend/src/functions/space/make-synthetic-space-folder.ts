import type { SpaceFolder } from '#common/zod/backend/space-folder';

export function makeSyntheticSpaceFolder(item: {
  id: string;
  title: string;
  children?: SpaceFolder['children'];
}): SpaceFolder {
  let { id, title, children } = item;

  return {
    type: 'spaceFolder',
    id: id,
    space: id,
    filePath: '',
    title: title,
    accessRoles: [],
    accessRolesCombined: [],
    isSynthetic: true,
    children: children ?? []
  };
}
