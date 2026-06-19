import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import type { FileSpaceFolder } from '#common/zod/blockml/internal/file-space-folder';
import { log } from '../extra/log';

let func = FuncEnum.MakeFilePartSpaces;

export function makeFilePartSpaces(
  item: {
    spaces: FileSpace[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): FilePartSpace[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let spaces: FilePartSpace[] = [];

  item.spaces.forEach(fileSpace => {
    let folders = fileSpace.folders;
    let space: FilePartSpace = Object.assign({}, fileSpace);

    delete (space as FileSpace).folders;

    spaces.push(space);

    let isFoldersArray = Array.isArray(folders);

    if (isFoldersArray) {
      pushFilePartSpaceFolders({
        folders: folders,
        parentSpace: fileSpace.space,
        fileName: fileSpace.fileName,
        filePath: fileSpace.filePath,
        fileExt: fileSpace.fileExt,
        spaces: spaces
      });
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Spaces, spaces);

  return spaces;
}

function pushFilePartSpaceFolders(item: {
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
      pushFilePartSpaceFolders({
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
