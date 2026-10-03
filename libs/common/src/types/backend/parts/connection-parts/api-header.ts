import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ApiHeader = { key: string; value: string };

export let zApiHeader = z
  .object({
    key: z.string(),
    value: z.string()
  })
  .meta({ id: 'ApiHeader' });

assertTypesEqual<ApiHeader, z.infer<typeof zApiHeader>>({ value: true });
