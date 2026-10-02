import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgRequest = {
  operation: 'getOrg';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
  };
};

export let zToBackendGetOrgRequest = z
  .strictObject({
    operation: z.literal('getOrg'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string()
      })
      .meta({ id: 'ToBackendGetOrgInput' })
  })
  .meta({ id: 'ToBackendGetOrgRequest' });

assertTypesEqual<
  ToBackendGetOrgRequest,
  z.infer<typeof zToBackendGetOrgRequest>
>({ value: true });
