import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/extra/log';
import { MPROVE_EXPLORER_FILENAME } from '#common/constants/top';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { BmlFile } from '#common/zod/blockml/bml-file';

let func = FuncEnum.CheckMproveExplorer;

export function buildExplorer(item: {
  files: BmlFile[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<string, never> {
  let { caller, structId, cs, files } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, {
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
        title: ErTitleEnum.DUPLICATE_MPROVE_EXPLORER_FILES,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, errors);

  let mproveExplorer: string =
    mproveExplorerFiles.length === 1
      ? mproveExplorerFiles[0].content
      : undefined;

  return Result.succeed(mproveExplorer);
}
