import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { MPROVE_EXPLORER_FILENAME } from '#common/constants/top';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import { log } from './log';

let func = FuncEnum.CheckMproveExplorer;

export function buildExplorer(
  item: {
    files: BmlFile[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let mproveExplorerFiles = item.files.filter(
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

  return {
    mproveExplorer:
      mproveExplorerFiles.length === 1
        ? mproveExplorerFiles[0].content
        : undefined
  };
}
