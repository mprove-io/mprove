import { ConfigService } from '@nestjs/config';
import { barStoreNext } from '~blockml/barrels/bar-store-next';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildStoreNext(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
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

  stores = barStoreNext.checkStoreBuildMetricDetails(
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
