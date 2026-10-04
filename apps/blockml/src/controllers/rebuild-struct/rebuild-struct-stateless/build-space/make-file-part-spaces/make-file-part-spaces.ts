import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileSpace } from '#common/types/blockml/parts/internal/file-space';
import { pushFilePartSpaceFoldersRecursive } from './push-file-part-space-folders-recursive/push-file-part-space-folders-recursive';

let func: Func = 'extra/make-file-part-spaces';

export function makeFilePartSpaces(item: {
  spaces: FileSpace[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', logItem);

  let spaces: FilePartSpace[] = [];

  item.spaces.forEach(fileSpace => {
    let folders = fileSpace.folders;

    let space: FilePartSpace = Object.assign({}, fileSpace);

    delete (space as FileSpace).folders;

    spaces.push(space);

    if (Array.isArray(folders)) {
      pushFilePartSpaceFoldersRecursive({
        folders: folders,
        parentSpace: fileSpace.space,
        fileName: fileSpace.fileName,
        filePath: fileSpace.filePath,
        fileExt: fileSpace.fileExt,
        spaces: spaces
      });
    }
  });

  log(cs, caller, func, structId, 'out_spaces.log', spaces);

  return Result.succeed(spaces);
}
