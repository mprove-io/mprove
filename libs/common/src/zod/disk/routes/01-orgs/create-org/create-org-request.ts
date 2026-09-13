import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCreateOrgRequest = {
  operation: 'createOrg';
  traceId: string;
  input: {
    orgId: string;
  };
};

export let zToDiskCreateOrgRequest = z
  .strictObject({
    operation: z.literal('createOrg'),
    traceId: z.string(),
    input: z
      .object({
        orgId: z.string()
      })
      .meta({ id: 'ToDiskCreateOrgRequestInput' })
  })
  .meta({ id: 'ToDiskCreateOrgRequest' });

assertTypesEqual<
  ToDiskCreateOrgRequest,
  z.infer<typeof zToDiskCreateOrgRequest>
>({ value: true });
