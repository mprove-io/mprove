import { ConfigService } from '@nestjs/config';
import { barStoreStart } from '~blockml/barrels/bar-store-start';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildStoreStart(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let stores = item.stores;

  stores = barStoreStart.checkStoreFieldGroups(
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

  return stores;
}
