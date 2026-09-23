import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { log } from './log';
import { pushFilePartSpaceFoldersRecursive } from './push-file-part-space-folders-recursive';

let func = FuncEnum.MakeFilePartSpaces;

export function makeFilePartSpaces(item: {
  spaces: FileSpace[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  let { cs, ...logItem } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, logItem);

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

  log(cs, caller, func, structId, LogTypeEnum.Spaces, spaces);

  return Result.succeed(spaces);
}
