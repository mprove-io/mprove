import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

export function getSpaceFromFilePath(item: {
  filePath: string;
  spaces: FilePartSpace[];
}) {
  let { filePath, spaces } = item;

  let spaceNames = spaces.map(space => space.space);

  let pathParts = filePath.split('/').filter(part => part !== '');

  let folderParts = pathParts.slice(0, -1);

  let rootIndex = folderParts.findIndex(part => spaceNames.indexOf(part) > -1);

  if (rootIndex < 0) {
    return undefined;
  }

  let matchedSpace: string;

  let currentParts: string[] = [];

  folderParts.slice(rootIndex).forEach(part => {
    if (currentParts.length === 0 || matchedSpace === currentParts.join('.')) {
      currentParts.push(part);

      let candidateSpace = currentParts.join('.');

      if (spaceNames.indexOf(candidateSpace) > -1) {
        matchedSpace = candidateSpace;
      }
    }
  });

  return matchedSpace;
}
