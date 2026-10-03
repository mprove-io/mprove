import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RefreshItem = { label: string; value: number };

export let zRefreshItem = z
  .object({
    label: z.string(),
    value: z.number()
  })
  .meta({ id: 'RefreshItem' });

assertTypesEqual<RefreshItem, z.infer<typeof zRefreshItem>>({ value: true });
