import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteOrgInput = {
  orgId: string;
};

export type ToBackendDeleteOrgRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteOrgInput;
};

export let zToBackendDeleteOrgInput = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendDeleteOrgInput' });

export let zToBackendDeleteOrgRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteOrgInput
  })
  .meta({ id: 'ToBackendDeleteOrgRequest' });

assertTypesEqual<
  ToBackendDeleteOrgInput,
  z.infer<typeof zToBackendDeleteOrgInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteOrgRequest,
  z.infer<typeof zToBackendDeleteOrgRequest>
>({ value: true });
