import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type KeyValuePair = { key: string; value?: string };

export let zKeyValuePair = z
  .object({
    key: z.string(),
    value: z.string().nullish()
  })
  .meta({ id: 'KeyValuePair' });

assertTypesEqual<KeyValuePair, z.infer<typeof zKeyValuePair>>({ value: true });
