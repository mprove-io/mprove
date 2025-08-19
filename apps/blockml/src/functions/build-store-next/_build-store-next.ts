import { ConfigService } from '@nestjs/config';
import { barStoreNext } from '~blockml/barrels/bar-store-next';
import { BmError } from '~blockml/models/bm-error';

export function buildStoreNext(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let stores = item.stores;

  stores = barStoreNext.checkStoreBuildMetrics(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = barStoreNext.checkStoreRequiredParameters(
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
