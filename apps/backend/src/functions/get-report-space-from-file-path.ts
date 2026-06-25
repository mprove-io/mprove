import type { Space } from '#common/zod/blockml/space';

export function getReportSpaceFromFilePath(item: {
  filePath: string;
  spaces: Space[];
}) {
  // Example: input filePath "p1/data/s1/s2/unk/s3/r2.report" and spaces ["s1", "s1.s2"] should resolve to "s1.s2".
  let { filePath, spaces } = item;

  // Example: convert space objects to names so path segments can be matched against ["s1", "s1.s2"].
  let spaceNames = spaces.map(space => space.space);

  // Example: split normalized file node id "p1/data/s1/s2/unk/s3/r2.report" into path parts including the report file name.
  let pathParts = filePath.split('/');

  // Example: drop "r2.report" because only folders can imply a report space.
  let folderParts = pathParts.slice(0, -1);

  // Example: find the first folder that is a known root space, such as "s1".
  let rootIndex = folderParts.findIndex(part => spaceNames.indexOf(part) > -1);

  // Example: if no folder matches a known space, the report has no path-derived space.
  if (rootIndex < 0) {
    return undefined;
  }

  // Example: this is updated from "s1" to "s1.s2" as deeper valid spaces are found.
  let matchedSpace: string;

  // Example: this accumulates folder parts as ["s1"] then ["s1", "s2"].
  let currentParts: string[] = [];

  // Example: scan from the first known space folder through the rest of the report path.
  folderParts.slice(rootIndex).forEach(part => {
    // Example: after "unk" breaks the continuous space path, later folders are ignored.
    let isContinuousSpacePath =
      currentParts.length === 0 || matchedSpace === currentParts.join('.');

    // Example: keep walking while accumulated folders still form a valid space chain.
    if (isContinuousSpacePath) {
      // Example: add "s2" so ["s1"] becomes ["s1", "s2"].
      currentParts.push(part);

      // Example: ["s1", "s2"] becomes candidate space "s1.s2".
      let candidateSpace = currentParts.join('.');

      // Example: only accept candidate "s1.s2" if it exists in the known spaces list.
      let isSpace = spaceNames.indexOf(candidateSpace) > -1;

      // Example: remember deepest known candidate, so "s1.s2" replaces "s1".
      if (isSpace) {
        matchedSpace = candidateSpace;
      }
    }
  });

  // Example: returns "s1.s2" for a report anywhere below the "s1/s2" space path.
  return matchedSpace;
}
