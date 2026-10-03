import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Org = {
  orgId: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  serverTs: number;
};

export let zOrg = z
  .object({
    orgId: z.string(),
    name: z.string(),
    ownerId: z.string(),
    ownerEmail: z.string(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Org' });

assertTypesEqual<Org, z.infer<typeof zOrg>>({ value: true });
