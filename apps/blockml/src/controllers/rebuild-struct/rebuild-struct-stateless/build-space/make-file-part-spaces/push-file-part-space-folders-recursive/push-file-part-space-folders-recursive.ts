import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileSpaceFolder } from '#common/zod/blockml/internal/file-space-folder';

export function pushFilePartSpaceFoldersRecursive(item: {
  folders: FileSpaceFolder[];
  parentSpace: string;
  fileName: string;
  filePath: string;
  fileExt: FilePartSpace['fileExt'];
  spaces: FilePartSpace[];
}) {
  let { folders, parentSpace, fileName, filePath, fileExt, spaces } = item;

  folders.forEach(folder => {
    if (folder?.constructor !== Object) {
      return;
    }

    if (typeof folder.space !== 'string') {
      return;
    }

    let folderSpace = `${parentSpace}.${folder.space}`;
    let nestedFolders = folder.folders;
    let space: FilePartSpace = Object.assign({}, folder, {
      name: folderSpace,
      fileName: fileName,
      filePath: filePath,
      fileExt: fileExt,
      space: folderSpace,
      accessRolesCombined: []
    });

    delete (space as FileSpaceFolder).folders;

    spaces.push(space);

    let isNestedFoldersArray = Array.isArray(nestedFolders);

    if (isNestedFoldersArray) {
      pushFilePartSpaceFoldersRecursive({
        folders: nestedFolders,
        parentSpace: folderSpace,
        fileName: fileName,
        filePath: filePath,
        fileExt: fileExt,
        spaces: spaces
      });
    }
  });
}
