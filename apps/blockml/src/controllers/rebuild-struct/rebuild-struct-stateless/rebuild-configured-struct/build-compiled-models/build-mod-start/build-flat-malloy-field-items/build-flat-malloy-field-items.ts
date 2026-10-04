import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';
import { getMalloyFieldItems } from './get-malloy-field-items/get-malloy-field-items';

let func: Func = 'build-mod-start/build-flat-malloy-field-items';

export function buildFlatMalloyFieldItems(item: {
  mods: FileMod[];
  projectId: string;
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_mods.log', newMods);

  return Result.succeed(newMods);
}
