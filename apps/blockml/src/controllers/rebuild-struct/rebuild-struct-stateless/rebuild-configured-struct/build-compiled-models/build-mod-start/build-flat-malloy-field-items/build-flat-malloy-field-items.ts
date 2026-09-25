import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import { getMalloyFieldItems } from './get-malloy-field-items/get-malloy-field-items';

let func = FuncEnum.BuildFlatMalloyFieldItems;

export function buildFlatMalloyFieldItems(item: {
  mods: FileMod[];
  projectId: string;
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newMods: FileMod[] = [];

  item.mods.forEach(mod => {
    let malloyModel = mod.malloyModel;

    let source = mod.source;

    let valueWithSourceInfo = mod.valueWithSourceInfo;

    if (
      isUndefined(malloyModel) ||
      isUndefined(source) ||
      isUndefined(valueWithSourceInfo)
    ) {
      return;
    }

    mod.flatMalloyFieldItems = getMalloyFieldItems({
      malloyModelDef: malloyModel._modelDef,
      source: source,
      valueWithSourceInfo: valueWithSourceInfo,
      fileName: mod.fileName,
      filePath: mod.filePath,
      projectId: item.projectId,
      cs: cs
    });

    newMods.push(mod);
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return Result.succeed(newMods);
}
