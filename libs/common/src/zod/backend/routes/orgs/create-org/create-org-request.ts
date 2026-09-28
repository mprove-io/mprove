import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateOrgRequest = {
  operation: 'createOrg';
  traceId: string;
  idempotencyKey: string;
  input: {
    name: string;
  };
};

export let zToBackendCreateOrgRequest = z
  .strictObject({
    operation: z.literal('createOrg'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        name: z.string()
      })
      .meta({ id: 'ToBackendCreateOrgInput' })
  })
  .meta({ id: 'ToBackendCreateOrgRequest' });

assertTypesEqual<
  ToBackendCreateOrgRequest,
  z.infer<typeof zToBackendCreateOrgRequest>
>({ value: true });
