import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Preset } from '#common/zod/blockml/preset';
import { applyStorePresets } from './apply-store-presets/apply-store-presets';
import { checkResultFractionTypes } from './check-result-fraction-types/check-result-fraction-types';
import { checkStoreFieldGroups } from './check-store-field-groups/check-store-field-groups';
import { checkStoreFieldTimeGroups } from './check-store-field-time-groups/check-store-field-time-groups';
import { checkStoreResults } from './check-store-results/check-store-results';

export function buildStoreStart(item: {
  presets: Preset[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileStore[], never> {
  let { cs } = item;

  let stores: FileStore[] = item.stores;

  stores = applyStorePresets(
    {
      stores: stores,
      presets: item.presets,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = checkStoreFieldGroups(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = checkStoreFieldTimeGroups(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = checkStoreResults(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = checkResultFractionTypes(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return Result.succeed(stores);
}
