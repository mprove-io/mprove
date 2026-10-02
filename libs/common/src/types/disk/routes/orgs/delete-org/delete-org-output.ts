import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskDeleteOrgOutput = {
  deletedOrgId: string;
};

export let zToDiskDeleteOrgOutput = z
  .object({
    deletedOrgId: z.string()
  })
  .meta({ id: 'ToDiskDeleteOrgOutput' });

assertTypesEqual<ToDiskDeleteOrgOutput, z.infer<typeof zToDiskDeleteOrgOutput>>(
  { value: true }
);
