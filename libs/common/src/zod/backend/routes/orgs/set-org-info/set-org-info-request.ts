import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetOrgInfoInput = {
  orgId: string;
  name?: string;
};

export type ToBackendSetOrgInfoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetOrgInfoInput;
};

export let zToBackendSetOrgInfoInput = z
  .object({
    orgId: z.string(),
    name: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetOrgInfoInput' });

export let zToBackendSetOrgInfoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetOrgInfoInput
  })
  .meta({ id: 'ToBackendSetOrgInfoRequest' });

assertTypesEqual<
  ToBackendSetOrgInfoInput,
  z.infer<typeof zToBackendSetOrgInfoInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetOrgInfoRequest,
  z.infer<typeof zToBackendSetOrgInfoRequest>
>({ value: true });
