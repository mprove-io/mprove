import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import { checkStoreBuildMetrics } from './check-store-build-metrics/check-store-build-metrics';
import { checkStoreRequiredParameters } from './check-store-required-parameters/check-store-required-parameters';
import { checkStoreSpaces } from './check-store-spaces/check-store-spaces';

export function buildStoreNext(item: {
  stores: FileStore[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileStore[], never> {
  let { cs } = item;

  let stores: FileStore[] = item.stores;

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

  stores = checkStoreSpaces(
    {
      stores: stores,
      spaces: item.spaces,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return Result.succeed(stores);
}
