import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

export type CalculateDiskShardError = BackendWrongTotalDiskShardsError;

export let zCalculateDiskShardError = zBackendWrongTotalDiskShardsError;

assertTypesEqual<
  CalculateDiskShardError,
  z.infer<typeof zCalculateDiskShardError>
>({ value: true });
