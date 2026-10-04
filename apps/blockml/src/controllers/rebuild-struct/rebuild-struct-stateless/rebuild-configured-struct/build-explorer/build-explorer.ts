import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MPROVE_EXPLORER_FILENAME } from '#common/constants/top';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';

let func: Func = 'extra/check-mprove-explorer';

export function buildExplorer(item: {
  files: BmlFile[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<string, never> {
  let { caller, structId, cs, files } = item;

  log(cs, caller, func, structId, 'input.log', {
    files: files,
    errors: item.errors,
    structId: structId,
    caller: caller
  });

  let mproveExplorerFiles: BmlFile[] = files.filter(
    file => file.name.toLowerCase() === MPROVE_EXPLORER_FILENAME
  );

  let errors: BmError[] = [];

  if (mproveExplorerFiles.length > 1) {
    errors.push(
      new BmError({
        title: 'DUPLICATE_MPROVE_EXPLORER_FILES',
        message: `Only one ${MPROVE_EXPLORER_FILENAME} file is allowed`,
        lines: mproveExplorerFiles.map(file => ({
          line: 0,
          name: file.name,
          path: file.path
        }))
      })
    );
  }

  item.errors.push(...errors);

  log(cs, caller, func, structId, 'out_errors.log', errors);

  let mproveExplorer: string =
    mproveExplorerFiles.length === 1
      ? mproveExplorerFiles[0].content
      : undefined;

  return Result.succeed(mproveExplorer);
}
