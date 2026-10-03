import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type DeleteFilterFnItem = { filterFieldId: string; tileTitle: string };

export let zDeleteFilterFnItem = z
  .object({
    filterFieldId: z.string(),
    tileTitle: z.string()
  })
  .meta({ id: 'DeleteFilterFnItem' });

assertTypesEqual<DeleteFilterFnItem, z.infer<typeof zDeleteFilterFnItem>>({
  value: true
});
