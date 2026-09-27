import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskCreateOrgOutput = {
  orgId: string;
};

export let zToDiskCreateOrgOutput = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskCreateOrgOutput' });

assertTypesEqual<ToDiskCreateOrgOutput, z.infer<typeof zToDiskCreateOrgOutput>>(
  { value: true }
);
