import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StateModelItem = { modelId: string; url: string };

export let zStateModelItem = z
  .object({
    modelId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateModelItem' });

assertTypesEqual<StateModelItem, z.infer<typeof zStateModelItem>>({
  value: true
});
