import { ConfigService } from '@nestjs/config';
import { barStoreStart } from '~blockml/barrels/bar-store-start';
import { BmError } from '~blockml/models/bm-error';

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

  stores = barStoreStart.applyStorePresets(
    {
      stores: stores,
      presets: item.presets,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = barStoreStart.checkStoreFieldGroups(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = barStoreStart.checkStoreFieldTimeGroups(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = barStoreStart.checkStoreResults(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = barStoreStart.checkResultFractionTypes(
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
