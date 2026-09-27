import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetOrgOwnerInput = {
  orgId: string;
  ownerEmail: string;
};

export type ToBackendSetOrgOwnerRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetOrgOwnerInput;
};

export let zToBackendSetOrgOwnerInput = z
  .object({
    orgId: z.string(),
    ownerEmail: z.string()
  })
  .meta({ id: 'ToBackendSetOrgOwnerInput' });

export let zToBackendSetOrgOwnerRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetOrgOwnerInput
  })
  .meta({ id: 'ToBackendSetOrgOwnerRequest' });

assertTypesEqual<
  ToBackendSetOrgOwnerInput,
  z.infer<typeof zToBackendSetOrgOwnerInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetOrgOwnerRequest,
  z.infer<typeof zToBackendSetOrgOwnerRequest>
>({ value: true });
