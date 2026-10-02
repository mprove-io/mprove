import { z } from 'zod';

export let zRefreshItem = z
  .object({
    label: z.string(),
    value: z.number()
  })
  .meta({ id: 'RefreshItem' });

export type RefreshItem = z.infer<typeof zRefreshItem>;
