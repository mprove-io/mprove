import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgInput = {
  orgId: string;
};

export type ToBackendGetOrgRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetOrgInput;
};

export let zToBackendGetOrgInput = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendGetOrgInput' });

export let zToBackendGetOrgRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetOrgInput
  })
  .meta({ id: 'ToBackendGetOrgRequest' });

assertTypesEqual<ToBackendGetOrgInput, z.infer<typeof zToBackendGetOrgInput>>({
  value: true
});

assertTypesEqual<
  ToBackendGetOrgRequest,
  z.infer<typeof zToBackendGetOrgRequest>
>({ value: true });
