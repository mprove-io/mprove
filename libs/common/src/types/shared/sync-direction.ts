import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const syncDirectionValues = ['from-server', 'to-server'] as const;

export type SyncDirection = (typeof syncDirectionValues)[number];

export let zSyncDirection = z.enum(syncDirectionValues);

assertTypesEqual<SyncDirection, z.infer<typeof zSyncDirection>>({
  value: true
});
