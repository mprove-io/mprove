import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputOrgsItem = {
  orgId?: string;
  name: string;
  ownerId?: string;
  ownerEmail: string;
};

export let zToBackendSeedRecordsInputOrgsItem = z
  .object({
    orgId: z.string().nullish(),
    name: z.string(),
    ownerId: z.string().nullish(),
    ownerEmail: z.string()
  })
  .meta({ id: 'ToBackendSeedRecordsInputOrgsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputOrgsItem,
  z.infer<typeof zToBackendSeedRecordsInputOrgsItem>
>({ value: true });
