import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { File2 } from '#common/types/blockml/parts/internal/file/file-2';
import type { File3 } from '#common/types/blockml/parts/internal/file/file-3';
import type { FileErrorLine } from '#common/types/blockml/parts/internal/file-error-line';

let func: Func = 'build-yaml/deduplicate-file-names';

export function deduplicateFileNames(item: {
  file2s: File2[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<File3[], never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
          title: 'DUPLICATE_FILE_NAMES',
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

  log(cs, caller, func, structId, 'out_file3s.log', file3s);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(file3s);
}
