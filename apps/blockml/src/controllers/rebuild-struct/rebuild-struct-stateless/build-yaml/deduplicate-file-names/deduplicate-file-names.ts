import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { File2 } from '#common/zod/blockml/internal/file-2';
import type { File3 } from '#common/zod/blockml/internal/file-3';
import type { FileErrorLine } from '#common/zod/blockml/internal/file-error-line';

let func = FuncEnum.DeduplicateFileNames;

export function deduplicateFileNames(item: {
  file2s: File2[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<File3[], never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let file3s: File3[] = [];

  item.file2s.forEach((x: File2) => {
    if (x.pathContents.length > 1) {
      let lines: FileErrorLine[] = x.pathContents.map(fp => ({
        line: 0,
        name: x.name,
        path: fp.path
      }));

      item.errors.push(
        new BmError({
          title: ErTitleEnum.DUPLICATE_FILE_NAMES,
          message:
            'Mprove Files file names must be unique across all folders. ' +
            `Found duplicate ${x.name} files`,
          lines: lines
        })
      );
    } else {
      file3s.push({
        name: x.name,
        ext: x.ext,
        path: x.pathContents[0].path,
        content: x.pathContents[0].content
      });
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.File3s, file3s);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return Result.succeed(file3s);
}
