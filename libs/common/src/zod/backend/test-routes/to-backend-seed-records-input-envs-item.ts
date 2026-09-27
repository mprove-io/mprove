import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Ev, zEv } from '#common/zod/backend/ev';

export type ToBackendSeedRecordsInputEnvsItem = {
  projectId: string;
  envId: string;
  evs?: Ev[];
};

export let zToBackendSeedRecordsInputEnvsItem = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evs: z.array(zEv).nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputEnvsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputEnvsItem,
  z.infer<typeof zToBackendSeedRecordsInputEnvsItem>
>({ value: true });
