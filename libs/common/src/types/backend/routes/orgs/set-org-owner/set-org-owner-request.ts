import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetOrgOwnerRequest = {
  operation: 'setOrgOwner';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    ownerEmail: string;
  };
};

export let zToBackendSetOrgOwnerRequest = z
  .strictObject({
    operation: z.literal('setOrgOwner'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string(),
        ownerEmail: z.string()
      })
      .meta({ id: 'ToBackendSetOrgOwnerInput' })
  })
  .meta({ id: 'ToBackendSetOrgOwnerRequest' });

assertTypesEqual<
  ToBackendSetOrgOwnerRequest,
  z.infer<typeof zToBackendSetOrgOwnerRequest>
>({ value: true });
