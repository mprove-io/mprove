import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

export type CalculateDiskShardResultError = BackendWrongTotalDiskShardsError;

export let zCalculateDiskShardResultError = zBackendWrongTotalDiskShardsError;

assertTypesEqual<
  CalculateDiskShardResultError,
  z.infer<typeof zCalculateDiskShardResultError>
>({ value: true });
