import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Timezone = { value: string; name: string };

export let zTimezone = z
  .object({
    value: z.string(),
    name: z.string()
  })
  .meta({ id: 'Timezone' });

assertTypesEqual<Timezone, z.infer<typeof zTimezone>>({ value: true });
