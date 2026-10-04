import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Listener = { rowId: string; applyTo: string; listen: string };

export let zListener = z
  .object({
    rowId: z.string(),
    applyTo: z.string(),
    listen: z.string()
  })
  .meta({ id: 'Listener' });

assertTypesEqual<Listener, z.infer<typeof zListener>>({ value: true });
