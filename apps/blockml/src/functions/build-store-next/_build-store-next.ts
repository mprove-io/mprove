import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { checkStoreBuildMetrics } from './check-store-build-metrics';
import { checkStoreRequiredParameters } from './check-store-required-parameters';

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

  stores = checkStoreBuildMetrics(
    {
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  stores = checkStoreRequiredParameters(
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
