import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Sorting = { fieldId: string; desc: boolean };

export let zSorting = z
  .object({
    fieldId: z.string(),
    desc: z.boolean()
  })
  .meta({ id: 'Sorting' });

assertTypesEqual<Sorting, z.infer<typeof zSorting>>({ value: true });
