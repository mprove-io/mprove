import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateOrgInput = {
  name: string;
};

export type ToBackendCreateOrgRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateOrgInput;
};

export let zToBackendCreateOrgInput = z
  .object({
    name: z.string()
  })
  .meta({ id: 'ToBackendCreateOrgInput' });

export let zToBackendCreateOrgRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateOrgInput
  })
  .meta({ id: 'ToBackendCreateOrgRequest' });

assertTypesEqual<
  ToBackendCreateOrgInput,
  z.infer<typeof zToBackendCreateOrgInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateOrgRequest,
  z.infer<typeof zToBackendCreateOrgRequest>
>({ value: true });
