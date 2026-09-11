import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteOrgRequest = {
  operation: 'deleteOrg';
  traceId: string;
  input: {
    orgId: string;
  };
};

export let zToDiskDeleteOrgRequest = z
  .strictObject({
    operation: z.literal('deleteOrg'),
    traceId: z.string(),
    input: z
      .object({
        orgId: z.string()
      })
      .meta({ id: 'ToDiskDeleteOrgRequestInput' })
  })
  .meta({ id: 'ToDiskDeleteOrgRequest' });

assertTypesEqual<
  ToDiskDeleteOrgRequest,
  z.infer<typeof zToDiskDeleteOrgRequest>
>({ value: true });
