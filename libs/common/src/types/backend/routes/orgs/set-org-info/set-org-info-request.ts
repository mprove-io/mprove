import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetOrgInfoRequest = {
  operation: 'setOrgInfo';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    name?: string;
  };
};

export let zToBackendSetOrgInfoRequest = z
  .strictObject({
    operation: z.literal('setOrgInfo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string(),
        name: z.string().nullish()
      })
      .meta({ id: 'ToBackendSetOrgInfoInput' })
  })
  .meta({ id: 'ToBackendSetOrgInfoRequest' });

assertTypesEqual<
  ToBackendSetOrgInfoRequest,
  z.infer<typeof zToBackendSetOrgInfoRequest>
>({ value: true });
