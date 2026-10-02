import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongTotalDiskShardsError = {
  code: 'BACKEND_WRONG_TOTAL_DISK_SHARDS';
};

export let zBackendWrongTotalDiskShardsError = z.object({
  code: z.literal('BACKEND_WRONG_TOTAL_DISK_SHARDS')
});

assertTypesEqual<
  BackendWrongTotalDiskShardsError,
  z.infer<typeof zBackendWrongTotalDiskShardsError>
>({ value: true });
