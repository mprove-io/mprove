import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OrgsItem = { orgId: string; name: string };

export let zOrgsItem = z
  .object({
    orgId: z.string(),
    name: z.string()
  })
  .meta({ id: 'OrgsItem' });

assertTypesEqual<OrgsItem, z.infer<typeof zOrgsItem>>({ value: true });
