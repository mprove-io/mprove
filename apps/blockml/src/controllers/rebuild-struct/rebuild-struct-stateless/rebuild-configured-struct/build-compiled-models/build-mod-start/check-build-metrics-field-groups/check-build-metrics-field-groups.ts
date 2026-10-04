import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';
import { checkModBuildMetricsFieldGroups } from './check-mod-build-metrics-field-groups/check-mod-build-metrics-field-groups';

let func: Func = 'build-mod-start/check-build-metrics-field-groups';

export function checkBuildMetricsFieldGroups(item: {
  mods: FileMod[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  let newMods: FileMod[] = [];

  item.mods.forEach(mod => {
    let errorsOnStart = item.errors.length;

    let fieldItems = mod.flatMalloyFieldItems;

    if (isUndefined(fieldItems)) {
      return;
    }

    checkModBuildMetricsFieldGroups({
      fieldItems: fieldItems,
      errors: item.errors
    });

    if (errorsOnStart === item.errors.length) {
      newMods.push(mod);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_mods.log', newMods);

  return Result.succeed(newMods);
}
