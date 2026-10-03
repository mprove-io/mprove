import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ApiHeader,
  zApiHeader
} from '#common/types/backend/parts/connection-parts/api-header';

export type OptionsStoreApi = { headers?: ApiHeader[]; baseUrl?: string };

export let zOptionsStoreApi = z
  .object({
    headers: z.array(zApiHeader).nullish(),
    baseUrl: z.string().nullish()
  })
  .meta({ id: 'OptionsStoreApi' });

assertTypesEqual<OptionsStoreApi, z.infer<typeof zOptionsStoreApi>>({
  value: true
});
