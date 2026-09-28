import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteOrgRequest = {
  operation: 'deleteOrg';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
  };
};

export let zToBackendDeleteOrgRequest = z
  .strictObject({
    operation: z.literal('deleteOrg'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string()
      })
      .meta({ id: 'ToBackendDeleteOrgInput' })
  })
  .meta({ id: 'ToBackendDeleteOrgRequest' });

assertTypesEqual<
  ToBackendDeleteOrgRequest,
  z.infer<typeof zToBackendDeleteOrgRequest>
>({ value: true });
