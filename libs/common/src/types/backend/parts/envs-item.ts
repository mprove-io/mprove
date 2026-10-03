import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EnvsItem = { envId: string; projectId: string };

export let zEnvsItem = z
  .object({
    envId: z.string(),
    projectId: z.string()
  })
  .meta({ id: 'EnvsItem' });

assertTypesEqual<EnvsItem, z.infer<typeof zEnvsItem>>({ value: true });
