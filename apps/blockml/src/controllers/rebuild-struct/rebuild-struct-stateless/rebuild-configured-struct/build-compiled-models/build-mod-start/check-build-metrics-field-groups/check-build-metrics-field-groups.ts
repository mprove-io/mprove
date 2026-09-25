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
import { checkModBuildMetricsFieldGroups } from './check-mod-build-metrics-field-groups/check-mod-build-metrics-field-groups';

let func = FuncEnum.CheckBuildMetricsFieldGroups;

export function checkBuildMetricsFieldGroups(item: {
  mods: FileMod[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileMod[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return Result.succeed(newMods);
}
