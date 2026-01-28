import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { Preset } from '#common/interfaces/blockml/preset';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { applyStorePresets } from './apply-store-presets';
import { checkResultFractionTypes } from './check-result-fraction-types';
import { checkStoreFieldGroups } from './check-store-field-groups';
import { checkStoreFieldTimeGroups } from './check-store-field-time-groups';
import { checkStoreResults } from './check-store-results';

export function buildStoreStart(
  item: {
    presets: Preset[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let stores = item.stores;

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

  return stores;
}
