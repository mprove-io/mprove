import { getUserFolderNodeId } from '#backend/functions/get-user-folder-node-id';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { Space } from '#common/zod/blockml/space';

export function getTargetParentNodeId(item: {
  projectId: string;
  mproveDirValue: string;
  userAlias: string;
  space: string | null | undefined;
  spaces: Pick<Space, 'space' | 'filePath'>[];
}) {
  // Example: requested space "s1" targets "p1/data/s1"; undefined targets the user folder.
  let { projectId, mproveDirValue, userAlias, space, spaces } = item;

  // Example: when a unit is changed to no space, move it to "mprove-users/<alias>".
  if (isUndefined(space)) {
    // Example: returns "p1/data/mprove-users/alice" when mprove_dir is "./data".
    return getUserFolderNodeId({
      projectId: projectId,
      mproveDirValue: mproveDirValue,
      userAlias: userAlias
    });
  }

  // Example: find metadata for selected space "s1.s2" in currentStruct.spaces.
  let selectedSpace = spaces.find(x => x.space === space);

  // Example: if the selected space no longer exists, fall back to the user folder.
  if (isUndefined(selectedSpace)) {
    // Example: avoids guessing a folder for a stale UI-selected space.
    return getUserFolderNodeId({
      projectId: projectId,
      mproveDirValue: mproveDirValue,
      userAlias: userAlias
    });
  }

  // Example: split normalized file node id "p1/data/s1/s1.space" into path parts.
  let selectedSpaceFilePathParts = selectedSpace.filePath.split('/');

  // Example: remove "s1.space" to get the defining space folder "p1/data/s1".
  let selectedSpaceFolderParts = selectedSpaceFilePathParts.slice(0, -1);

  // Example: turn the defining file name "s1.space" into root space folder name "s1".
  let selectedSpaceFileName = selectedSpaceFilePathParts[
    selectedSpaceFilePathParts.length - 1
  ].replace(FileExtensionEnum.Space, '');

  // Example: split selected space "s1.s2" into ["s1", "s2"].
  let spaceParts = selectedSpace.space.split('.');

  // Example: if "s1.space" defines "s1.s2", append only child part "s2".
  let childSpaceParts =
    spaceParts[0] === selectedSpaceFileName ? spaceParts.slice(1) : spaceParts;

  // Example: combine "p1/data/s1" and ["s2"] to target "p1/data/s1/s2".
  let targetFolderParts = [...selectedSpaceFolderParts, ...childSpaceParts];

  // Example: changing to "s1" returns "p1/data/s1" and drops non-space path like "unk/s3".
  return targetFolderParts.join('/');
}
