import { z } from 'zod';
import { zApiHeader } from '#common/zod/backend/connection-parts/api-header';

export let zOptionsStoreApi = z
  .object({
    headers: z.array(zApiHeader).nullish(),
    baseUrl: z.string().nullish()
  })
  .meta({ id: 'OptionsStoreApi' });

export type OptionsStoreApi = z.infer<typeof zOptionsStoreApi>;
