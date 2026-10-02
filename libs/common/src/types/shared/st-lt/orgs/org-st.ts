import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OrgSt = {
  name: string;
  ownerEmail: string;
};

export let zOrgSt = z
  .object({
    name: z.string(),
    ownerEmail: z.string()
  })
  .meta({ id: 'OrgSt' });

assertTypesEqual<OrgSt, z.infer<typeof zOrgSt>>({ value: true });
