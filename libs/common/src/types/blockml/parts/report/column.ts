import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Column = { columnId: number; label: string };

export let zColumn = z
  .object({
    columnId: z.number().int(),
    label: z.string()
  })
  .meta({ id: 'Column' });

assertTypesEqual<Column, z.infer<typeof zColumn>>({ value: true });
